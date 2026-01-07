export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || "https://your-app.com";

  return Response.json({
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    miniapp: {
      version: "1",
      name: "Locate Me",
      homeUrl: URL,
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "Find your location",
      description: "A mini app to locate and share your position.",
      primaryCategory: "utility",
      tags: ["location", "miniapp", "farcaster"],
    },
  });
}
