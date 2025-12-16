
export async function sendExpoPush(token: string, title: string, body: string) {
    console.log("📨 Sending push to:", token);
  
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        title,
        body,
        sound: "default",
      }),
    });
  
    const json = await res.json();
    console.log("📩 Expo response:", json);  // <—— QUAN TRỌNG
  }
  