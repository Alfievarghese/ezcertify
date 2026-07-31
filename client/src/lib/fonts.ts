// List of safe web fonts that don't need external loading
const SAFE_FONTS = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

// Keep track of fonts we have already injected into the document
const loadedFonts = new Set<string>();

/**
 * Dynamically loads a Google Font by adding a <link> tag to the document head.
 * @param fontFamily The name of the font (e.g. 'Playfair Display')
 * @returns Promise that resolves when the font is loaded and ready to use
 */
export async function loadFont(fontFamily: string): Promise<void> {
  if (!fontFamily || SAFE_FONTS.includes(fontFamily) || loadedFonts.has(fontFamily)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Format the font name for the Google Fonts URL (e.g., "Playfair+Display")
    const formattedName = fontFamily.replace(/\s+/g, '+');
    const url = `https://fonts.googleapis.com/css2?family=${formattedName}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;

    // Check if the link already exists (just in case it was added manually)
    if (document.querySelector(`link[href="${url}"]`)) {
      loadedFonts.add(fontFamily);
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    
    link.onload = () => {
      loadedFonts.add(fontFamily);
      // Ensure the font API has actually parsed and loaded the font before resolving
      if ('fonts' in document) {
        document.fonts.load(`16px "${fontFamily}"`).then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    };
    
    link.onerror = () => {
      console.warn(`Failed to load font: ${fontFamily}`);
      reject(new Error(`Failed to load font: ${fontFamily}`));
    };

    document.head.appendChild(link);
  });
}
