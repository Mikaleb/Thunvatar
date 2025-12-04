browser.customColumns.add('senderAddressColumn', 'Sender (@)', 'sender');
browser.customColumns.add(
  'senderDomainColumn',
  'Sender Domain (@)',
  'sender_domain',
);
browser.customColumns.add(
  'recipientsAddressesColumn',
  'Recipients (@)',
  'recipients',
);
browser.customColumns.add(
  'recipientsDomainsColumn',
  'Recipients Domains (@)',
  'recipients_domains',
);

// // Initialize when the extension is loaded
// browser.runtime.onInstalled.addListener(() => {
//   console.log('Company Icon Display extension installed');

//   // Load any cached icons from storage
//   browser.storage.local
//     .get('iconCache')
//     .then((result) => {
//       if (result.iconCache) {
//         // Filter out expired cache entries
//         const now = Date.now();
//         Object.entries(result.iconCache).forEach(([domain, data]) => {
//           if (now - data.timestamp < CACHE_EXPIRY) {
//             iconCache.set(domain, data.iconUrl);
//           }
//         });
//       }
//     })
//     .catch((error) => {
//       console.error('Error loading icon cache:', error);
//     });
// });

// // Listen for message list loaded event
// browser.CompanyIconAPI.onMessageListDisplayed.addListener(
//   handleMessageListDisplayed,
// );

// // Handle the message list display event
// async function handleMessageListDisplayed(messageRows) {
//   for (const row of messageRows) {
//     const sender = row.fromAddress;
//     if (!sender) continue;

//     const domain = extractDomain(sender);
//     if (!domain) continue;

//     let iconUrl;

//     // Check cache first
//     if (iconCache.has(domain)) {
//       iconUrl = iconCache.get(domain);
//     } else {
//       // Fetch icon if not in cache
//       iconUrl = await fetchCompanyIcon(domain);

//       // Update cache
//       iconCache.set(domain, iconUrl);

//       // Save to storage periodically (could be optimized with debounce)
//       saveIconCache();
//     }

//     // Update the message row with the icon
//     browser.CompanyIconAPI.addIconToSender(row.id, iconUrl);
//   }
// }

// // Extract domain from email address
// function extractDomain(email) {
//   const match = email.match(/@([^>]+)/);
//   return match ? match[1].toLowerCase() : null;
// }

// // Fetch company icon (favicon) for a domain
// async function fetchCompanyIcon(domain) {
//   try {
//     // Try Google's favicon service first
//     const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

//     // Verify the favicon exists and is accessible
//     const response = await fetch(googleFaviconUrl, { method: 'HEAD' });

//     if (response.ok) {
//       return googleFaviconUrl;
//     } else {
//       // Fallback to directly checking for favicon at the domain
//       const directFaviconUrl = `https://${domain}/favicon.ico`;
//       const directResponse = await fetch(directFaviconUrl, { method: 'HEAD' });

//       return directResponse.ok ? directFaviconUrl : DEFAULT_ICON;
//     }
//   } catch (error) {
//     console.error(`Error fetching favicon for ${domain}:`, error);
//     return DEFAULT_ICON;
//   }
// }

// // Save icon cache to storage
// function saveIconCache() {
//   const cacheObj = {};
//   const now = Date.now();

//   iconCache.forEach((iconUrl, domain) => {
//     cacheObj[domain] = {
//       iconUrl,
//       timestamp: now,
//     };
//   });

//   browser.storage.local.set({ iconCache: cacheObj }).catch((error) => {
//     console.error('Error saving icon cache:', error);
//   });
// }
