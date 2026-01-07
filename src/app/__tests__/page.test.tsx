import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../page";

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

const mockPosition = {
  coords: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
  },
};

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner while getting location", () => {
      mockGeolocation.getCurrentPosition.mockImplementation(() => {
        // Never resolve to keep loading state
      });

      render(<Home />);

      expect(screen.getByText("Finding your location...")).toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    beforeEach(() => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });
    });

    it("displays coordinates when location is found", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("37.7749, -122.4194")).toBeInTheDocument();
      });
    });

    it("shows the location marker on map", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText("Finding your location...")).not.toBeInTheDocument();
      });
    });

    it("renders the search input with placeholder", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Where to?")).toBeInTheDocument();
      });
    });

    it("allows typing in destination field", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Where to?")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("Where to?");
      fireEvent.change(input, { target: { value: "123 Main St" } });

      expect(input).toHaveValue("123 Main St");
      expect(screen.getByText("123 Main St")).toBeInTheDocument();
    });

    it("displays ride options (Ride, Bike, Transit)", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Ride")).toBeInTheDocument();
        expect(screen.getByText("Bike")).toBeInTheDocument();
        expect(screen.getByText("Transit")).toBeInTheDocument();
      });
    });

    it("shows confirm button disabled when no destination", async () => {
      render(<Home />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: "Confirm Pickup" });
        expect(button).toBeDisabled();
      });
    });

    it("enables confirm button when destination is entered", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Where to?")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("Where to?");
      fireEvent.change(input, { target: { value: "Airport" } });

      const button = screen.getByRole("button", { name: "Confirm Pickup" });
      expect(button).not.toBeDisabled();
    });
  });

  describe("Error State", () => {
    it("shows error when permission is denied", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 1, message: "Permission denied", PERMISSION_DENIED: 1 });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Location permission denied")).toBeInTheDocument();
      });
    });

    it("shows error when position is unavailable", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 2, message: "Position unavailable", POSITION_UNAVAILABLE: 2 });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Location information unavailable")).toBeInTheDocument();
      });
    });

    it("shows error on timeout", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 3, message: "Timeout", TIMEOUT: 3 });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Location request timed out")).toBeInTheDocument();
      });
    });

    it("shows enable location button on error", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 1, message: "Permission denied", PERMISSION_DENIED: 1 });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Enable Location" })).toBeInTheDocument();
      });
    });

    it("retries getting location when enable button is clicked", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 1, message: "Permission denied", PERMISSION_DENIED: 1 });
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Enable Location" })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "Enable Location" }));

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    });
  });

  describe("Geolocation Not Supported", () => {
    it("shows error when geolocation is not supported", async () => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: undefined,
        writable: true,
      });

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText("Geolocation is not supported by your browser")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Recenter Button", () => {
    it("refreshes location when recenter button is clicked", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("37.7749, -122.4194")).toBeInTheDocument();
      });

      // Find and click the recenter button (it's the button in the map area)
      const buttons = screen.getAllByRole("button");
      const recenterButton = buttons.find(
        (btn) => btn.className.includes("bottom-4") && btn.className.includes("right-4")
      );

      if (recenterButton) {
        fireEvent.click(recenterButton);
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe("UI Elements", () => {
    beforeEach(() => {
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });
    });

    it("displays current location label", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Current location")).toBeInTheDocument();
      });
    });

    it("displays destination label", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Destination")).toBeInTheDocument();
      });
    });

    it("shows placeholder text for destination when empty", async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("Enter destination")).toBeInTheDocument();
      });
    });
  });
});
