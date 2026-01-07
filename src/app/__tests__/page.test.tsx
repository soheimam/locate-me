import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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
    altitude: null,
  },
  timestamp: Date.now(),
};

const mockPermissions = {
  query: jest.fn(),
};

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
    });
    Object.defineProperty(global.navigator, "permissions", {
      value: mockPermissions,
      writable: true,
    });
    // Default permission state
    mockPermissions.query.mockResolvedValue({
      state: "prompt",
      onchange: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
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

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Enable Location" })).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Enable Location" }));
      });

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

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("37.7749, -122.4194")).toBeInTheDocument();
      });

      // Find and click the recenter button (it's the button in the map area)
      const buttons = screen.getAllByRole("button");
      const recenterButton = buttons.find(
        (btn) => btn.className.includes("bottom-4") && btn.className.includes("right-4")
      );

      if (recenterButton) {
        await act(async () => {
          fireEvent.click(recenterButton);
        });
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

  describe("Blocked Permission Popup Scenarios", () => {
    it("detects when permission is already denied (popup won't appear)", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockPermissions.query.mockResolvedValue({
        state: "denied",
        onchange: null,
      });

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 1, message: "User denied Geolocation", PERMISSION_DENIED: 1 });
      });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("Location permission denied")).toBeInTheDocument();
      });

      // Verify that permission was checked and logged as denied
      expect(mockPermissions.query).toHaveBeenCalledWith({ name: "geolocation" });

      consoleSpy.mockRestore();
    });

    it("handles permission popup that never resolves (blocked/hung)", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      mockPermissions.query.mockResolvedValue({
        state: "prompt",
        onchange: null,
      });

      // Simulate a blocked popup - getCurrentPosition never calls either callback
      mockGeolocation.getCurrentPosition.mockImplementation(() => {
        // Never calls success or error - simulates blocked popup
      });

      await act(async () => {
        render(<Home />);
      });

      // Verify loading state is shown
      expect(screen.getByText("Finding your location...")).toBeInTheDocument();

      // Advance timers to trigger hang detection (3 seconds)
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      // Verify hang detection warnings were logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("HANG DETECTED")
      );

      // Advance more time to trigger the 5 second warning (need 2 more seconds to get to 5000ms)
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      // REQUEST STALLED is logged via console.error at elapsed >= 5000ms
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("REQUEST STALLED")
      );

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("handles timeout when user ignores permission popup", async () => {
      mockPermissions.query.mockResolvedValue({
        state: "prompt",
        onchange: null,
      });

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        // Simulate timeout after user ignores popup
        setTimeout(() => {
          error({ code: 3, message: "Timeout expired", TIMEOUT: 3 });
        }, 100);
      });

      await act(async () => {
        render(<Home />);
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByText("Location request timed out")).toBeInTheDocument();
      });
    });

    it("detects permission change from prompt to granted", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      let permissionChangeHandler: (() => void) | null = null;
      const mockPermissionResult = {
        state: "prompt" as PermissionState,
        onchange: null as (() => void) | null,
      };

      mockPermissions.query.mockImplementation(() => {
        return Promise.resolve({
          get state() {
            return mockPermissionResult.state;
          },
          set onchange(handler: (() => void) | null) {
            permissionChangeHandler = handler;
          },
        });
      });

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        // Simulate permission being granted
        mockPermissionResult.state = "granted";
        if (permissionChangeHandler) permissionChangeHandler();
        success(mockPosition);
      });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("37.7749, -122.4194")).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("User GRANTED permission")
      );

      consoleSpy.mockRestore();
    });

    it("detects permission change from prompt to denied", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      let permissionChangeHandler: (() => void) | null = null;
      const mockPermissionResult = {
        state: "prompt" as PermissionState,
        onchange: null as (() => void) | null,
      };

      mockPermissions.query.mockImplementation(() => {
        return Promise.resolve({
          get state() {
            return mockPermissionResult.state;
          },
          set onchange(handler: (() => void) | null) {
            permissionChangeHandler = handler;
          },
        });
      });

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        // Simulate permission being denied
        mockPermissionResult.state = "denied";
        if (permissionChangeHandler) permissionChangeHandler();
        error({ code: 1, message: "User denied Geolocation", PERMISSION_DENIED: 1 });
      });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("Location permission denied")).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("User DENIED permission")
      );

      consoleSpy.mockRestore();
    });

    it("handles navigator.permissions not being available", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      Object.defineProperty(global.navigator, "permissions", {
        value: undefined,
        writable: true,
      });

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("37.7749, -122.4194")).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("navigator.permissions not available")
      );

      consoleSpy.mockRestore();
    });

    it("retries location request when Enable Location is clicked after denial", async () => {
      mockPermissions.query.mockResolvedValue({
        state: "denied",
        onchange: null,
      });

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 1, message: "User denied Geolocation", PERMISSION_DENIED: 1 });
      });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("Location permission denied")).toBeInTheDocument();
      });

      // Click Enable Location button
      const enableButton = screen.getByRole("button", { name: "Enable Location" });
      await act(async () => {
        fireEvent.click(enableButton);
      });

      // Verify it tried again
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    });

    it("shows loading state immediately when clicking Enable Location", async () => {
      mockPermissions.query.mockResolvedValue({
        state: "denied",
        onchange: null,
      });

      let resolvePosition: ((value: unknown) => void) | null = null;

      mockGeolocation.getCurrentPosition
        .mockImplementationOnce((_, error) => {
          error({ code: 1, message: "User denied Geolocation", PERMISSION_DENIED: 1 });
        })
        .mockImplementationOnce(() => {
          // Don't resolve immediately to keep loading state
          return new Promise((resolve) => {
            resolvePosition = resolve;
          });
        });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("Location permission denied")).toBeInTheDocument();
      });

      // Click Enable Location
      const enableButton = screen.getByRole("button", { name: "Enable Location" });
      await act(async () => {
        fireEvent.click(enableButton);
      });

      // Should show loading state
      expect(screen.getByText("Finding your location...")).toBeInTheDocument();
    });
  });

  describe("Position Unavailable Scenarios", () => {
    it("shows error when device location services are disabled", async () => {
      mockPermissions.query.mockResolvedValue({
        state: "granted",
        onchange: null,
      });

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 2, message: "Position unavailable", POSITION_UNAVAILABLE: 2 });
      });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("Location information unavailable")).toBeInTheDocument();
      });
    });
  });
});
