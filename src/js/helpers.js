
export async function getData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} when fetching ${url}`);
    }
    const result = await response.text();
    return result;

  } catch (error) {
    console.error("Error loading data:", error.message);
    return {
        error
    };
  }
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function errorTemplate(mssg, url) {
    const template = `
        <div style="padding: 20px; text-align: center; color: red;">
                    <h2>View Load Error</h2>
                    <p>Could not load the requested view (${url}).</p>
                    <p>Details: ${mssg}</p>
        </div>
    `
    return template;
}