# location-api-worker

[![Deploy to Cloudflare Workers](https://github.com/site-u2023/location-api-worker/actions/workflows/deploy.yml/badge.svg)](https://github.com/site-u2023/location-api-worker/actions/workflows/deploy.yml)

## Overview

`location-api-worker` is a Cloudflare Worker that provides geographic location information based on the client's IP address. It leverages Cloudflare's internal `request.cf` object, eliminating the need for external GeoIP database lookups or third-party API calls.

This Worker is primarily designed for use within the [aios (Auto Install OpenWrt System)](https://github.com/site-u2023/aios) project to automatically determine and set the correct timezone on OpenWrt devices during initial setup, even with minimal network configuration.

## Features

*   Retrieves GeoIP data directly from Cloudflare's edge network.
*   No external API dependencies or associated costs/rate limits.
*   Returns key location details like country, region, city, timezone, and Cloudflare colo.
*   Simple GET request interface.
*   Provides necessary CORS headers (`Access-Control-Allow-Origin: *`).

## Usage

### Endpoint

The Worker is typically deployed to a URL like:

```
https://location-api-worker.<your-workers-subdomain>.workers.dev
```

Replace `<your-workers-subdomain>` with your actual Cloudflare Workers subdomain.

### Example Requests

**Using `wget` (Common on OpenWrt):**

```bash
# Output to stdout
wget -qO- "https://location-api-worker.<your-workers-subdomain>.workers.dev"

# Save to a file
wget -O /tmp/location_info.json "https://location-api-worker.<your-workers-subdomain>.workers.dev"
```

**Using `curl` (Alternative):**

```bash
curl "https://location-api-worker.<your-workers-subdomain>.workers.dev"
```

## Response

### Success Example

The Worker returns a JSON object containing the location data available in the `request.cf` object.

```json
{
  "ip": "198.51.100.1",
  "asn": 64512,
  "colo": "NRT",
  "country": "JP",
  "city": "Tokyo",
  "region": "Tokyo",
  "regionCode": "13",
  "metroCode": "0",
  "postalCode": "100-0001",
  "latitude": "35.6895",
  "longitude": "139.6917",
  "timezone": "Asia/Tokyo",
  "continent": "AS",
  "isEUCountry": "false",
  "httpProtocol": "HTTP/2",
  "requestPriority": "weight=256;exclusive=1",
  "tlsCipher": "AEAD-AES128-GCM-SHA256",
  "tlsVersion": "TLSv1.3",
  "clientTrustScore": 99,
  "clientTcpRtt": 10
}
```

*Note: The exact fields returned may vary slightly depending on the information available to Cloudflare for the requesting IP address.*

### Field Descriptions

The fields correspond to the data available in the [Cloudflare `cf` object documentation](https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties).

## Deployment

This Worker is designed to be deployed using the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/).

1.  **Install Wrangler:**
    ```bash
    npm install -g wrangler
    ```
2.  **Configure `wrangler.toml`:**
    Ensure your `wrangler.toml` file is correctly configured with your `account_id` and the desired Worker `name`.
3.  **Deploy:**
    ```bash
    wrangler deploy
    ```

Deployment is automated via GitHub Actions in this repository upon pushing to the `main` branch.

## Related Projects

*   [aios (Auto Install OpenWrt System)](https://github.com/site-u2023/aios): Utilizes this Worker for automated timezone configuration.

## License

(Please add your chosen license here, e.g., MIT License)
```
