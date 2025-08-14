const nunjucks = require('nunjucks');
const fs = require('fs-extra');
const path = require('path');

// Configure Nunjucks
nunjucks.configure('templates', {
    autoescape: true,
    noCache: true
});

async function build() {
    console.log('🚀 Building Vistara website...');
    
    try {
        // Ensure dist directory exists
        await fs.ensureDir('dist');
        console.log('📁 Dist directory created/verified');
        
        // Copy assets if they exist
        if (await fs.pathExists('assets')) {
            await fs.copy('assets', 'dist');
            console.log('✅ Assets copied to dist/');
        } else {
            console.log('📂 No assets folder found, skipping...');
        }
        
        // Build pages
        const pages = [
            { template: 'index.njk', output: 'index.html' },
            { template: 'about.njk', output: 'about.html' },
            { template: 'contact.njk', output: 'contact.html' }
        ];
        
        let successCount = 0;
        
        for (const page of pages) {
            try {
                // Check if template exists
                const templatePath = path.join('templates', page.template);
                if (!(await fs.pathExists(templatePath))) {
                    console.warn(`⚠️  Template ${page.template} not found, skipping...`);
                    continue;
                }
                
                const html = nunjucks.render(page.template, {
                    page: page.template.replace('.njk', ''),
                    currentPage: page.template.replace('.njk', '')
                });
                
                await fs.writeFile(path.join('dist', page.output), html);
                console.log(`✅ Built ${page.template} → ${page.output}`);
                successCount++;
                
            } catch (error) {
                console.error(`❌ Error building ${page.template}:`, error.message);
            }
        }
        
        if (successCount > 0) {
            console.log(`\n🎉 Build complete! ${successCount} pages built successfully.`);
            console.log('🌐 Run "npm run serve" to preview your website at http://localhost:3000');
        } else {
            console.log('\n⚠️  No pages were built. Make sure your .njk templates exist in the templates/ folder.');
        }
        
    } catch (error) {
        console.error('💥 Build failed:', error.message);
        process.exit(1);
    }
}

// Run the build
build().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
});
