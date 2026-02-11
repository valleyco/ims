#!/usr/bin/env ts-node

/**
 * CLI Script to Download XML Feeds
 * Usage: npm run download-xml
 */

import { downloadAllFeeds, cleanOldDownloads } from '../src/xmlDownloader';

async function main() {
  console.log('==========================================');
  console.log('  IMS XML Feed Downloader');
  console.log('==========================================\n');
  
  try {
    // Download all feeds
    const metadata = await downloadAllFeeds();
    
    // Clean old downloads (keep last 7 days)
    console.log('\nCleaning old downloads...');
    cleanOldDownloads(7);
    
    console.log('\n✅ Download complete!');
    console.log(`   Directory: ${metadata.directory}`);
    console.log(`   Successful: ${metadata.successful}/${metadata.total}`);
    
    if (metadata.failed > 0) {
      console.log(`\n⚠️  ${metadata.failed} feed(s) failed to download:`);
      metadata.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.feed.name}: ${r.error}`);
        });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Download failed:', error);
    process.exit(1);
  }
}

main();
