const fetch = require('node-fetch');

async function testSearch() {
  console.log('Sending request to search API...');
  try {
    const res = await fetch('https://api-pecae.italohub.cloud/api/v1/search');
    console.log('Response status:', res.status);
    const text = await res.text();
    console.log('Response length:', text.length);
    try {
      const data = JSON.parse(text);
      console.log('Has more:', data.hasMore);
      console.log('Total items:', data.data?.length);
      console.log('First 3 items:');
      data.data?.slice(0, 3).forEach((item, index) => {
        console.log(`[${index}] Brand: ${item.brand}, Model: ${item.model}, Observations: ${item.observations || 'N/A'}`);
      });
    } catch (e) {
      console.log('Failed to parse JSON:', text.substring(0, 500));
    }
  } catch (err) {
    console.error('Error fetching search API:', err);
  }
}

testSearch();
