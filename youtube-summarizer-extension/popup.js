document.getElementById("summarize").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("youtube.com/watch")) {
    const videoId = new URL(tab.url).searchParams.get("v");
    const subtitles = await fetchSubtitles(videoId);

    if (subtitles) {
      const summary = await summarizeText(subtitles);
      document.getElementById("summary").value = summary;
    } else {
      document.getElementById("summary").value =
        "No se encontraron subtítulos para este video.";
    }
  } else {
    alert("Por favor, abre un video de YouTube.");
  }
});

async function fetchSubtitles(videoId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`
    );
    const data = await response.text();
    return parseSubtitles(data);
  } catch (error) {
    console.error("Error al obtener subtítulos:", error);
    return null;
  }
}

function parseSubtitles(data) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, "text/xml");
  const textNodes = xmlDoc.getElementsByTagName("text");
  let subtitles = "";

  for (let node of textNodes) {
    subtitles += node.textContent + " ";
  }

  return subtitles.trim();
}

async function summarizeText(text) {
  try {
    const response = await fetch("http://localhost:3000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });
    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error al generar el resumen:", error);
    return "No se pudo generar el resumen.";
  }
}
