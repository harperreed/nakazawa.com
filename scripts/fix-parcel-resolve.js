// ABOUTME: Post-build fix for Parcel 2.16+ import.meta.resolve() bug.
// ABOUTME: Replaces bare-specifier import.meta.resolve() calls with actual asset paths.

const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");

// Build a map of Parcel module IDs to their output file paths
// by scanning for known output patterns
function findAssetPaths() {
	const assets = {};

	// The service worker is always output to js/sw.js
	const swPath = path.join(distDir, "js", "sw.js");
	if (fs.existsSync(swPath)) {
		assets.sw = "/js/sw.js";
	}

	return assets;
}

// Fix import.meta.resolve("bareSpecifier") calls in built JS files
function fixResolves() {
	const assets = findAssetPaths();
	const files = fs.readdirSync(distDir).filter((f) => f.endsWith(".js") && !f.endsWith(".map"));

	let totalFixed = 0;

	for (const file of files) {
		const filePath = path.join(distDir, file);
		let content = fs.readFileSync(filePath, "utf8");

		// Replace import.meta.resolve("...") with the actual path
		// These are bare specifiers that browsers can't resolve
		const replaced = content.replace(
			/import\.meta\.resolve\("([^"]+)"\)/g,
			(match, moduleId) => {
				// For service worker registrations, use the known sw.js path
				if (assets.sw) {
					totalFixed++;
					return `"${assets.sw}"`;
				}
				// If we can't resolve it, leave it (will error at runtime but no worse)
				console.warn(`  Warning: could not resolve module ID "${moduleId}"`);
				return match;
			}
		);

		if (replaced !== content) {
			fs.writeFileSync(filePath, replaced, "utf8");
		}
	}

	if (totalFixed > 0) {
		console.log(`Fixed ${totalFixed} import.meta.resolve() call(s) in dist/`);
	}
}

fixResolves();
