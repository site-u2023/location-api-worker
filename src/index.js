/**
 * Cloudflare Worker to return client's geo-location information
 * based on Cloudflare's request.cf object.
 * Includes enhanced error handling and debugging information.
 */

export default {
  async fetch(request, env, ctx) {
    // Get client IP from header first, as it's useful even if cf object is missing
    const clientIp = request.headers.get('CF-Connecting-IP');

    try {
      // --- Debugging Start ---
      // Log the presence and content of request.cf (visible in Cloudflare logs)
      if (request.cf) {
        console.log("Debug: request.cf object is present. Content:", JSON.stringify(request.cf));
      } else {
        console.log("Debug: request.cf object is MISSING or undefined.");
      }
      // --- Debugging End ---

      // Check if the cf object exists. Crucial check.
      if (!request.cf) {
        // If cf object is missing, return a specific 'fail' status JSON
        const errorResponse = {
          status: "fail",
          message: "Cloudflare geo-location data (request.cf) was not available for this request.",
          query: clientIp || null, // Include IP if available
          reason: "The 'request.cf' object required for geo-location was missing or undefined.",
        };
        // Log the error before returning
        console.error("Error: request.cf object missing. Returning error response.");
        // Return a 400 Bad Request status as the required data is missing
        return new Response(JSON.stringify(errorResponse, null, 2), {
          status: 400, // Indicate client/request issue (missing expected data)
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Keep CORS header
          },
        });
      }

      // --- request.cf exists, proceed to extract data ---

      const countryCode = request.cf.country;
      const timezone = request.cf.timezone;
      const isp = request.cf.asOrganization;
      const asn = request.cf.asn;
      const regionName = request.cf.region;
      const regionCode = request.cf.regionCode;

      // Construct the 'as' field carefully, handling potential missing asn or isp
      let as = null;
      if (asn && isp) {
          as = `AS${asn} ${isp}`;
      } else if (isp) {
          as = isp;
      } else if (asn) {
          // Handle case where only ASN is available (less common but possible)
          as = `AS${asn}`;
      }
      // If both are missing, 'as' remains null

      // Construct the successful response JSON object
      const responseJson = {
        query: clientIp || null,
        status: "success",
        countryCode: countryCode || null,
        timezone: timezone || null,
        isp: isp || null,
        as: as || null,
        regionName: regionName || null,
        region: regionCode || null
        // For deeper debugging, you could temporarily include the raw cf object:
        // _raw_cf_data: request.cf
      };

      // Prepare and return the successful JSON response
      const responseBody = JSON.stringify(responseJson, null, 2);
      console.log("Debug: Successfully processed request. Returning geo-location data.");
      return new Response(responseBody, {
        status: 200, // OK status
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        },
      });

    } catch (error) {
      // Catch any unexpected errors during the entire process
      console.error("Critical Error: Caught unexpected exception in Worker fetch handler:", error.message, error.stack);
      const errorResponse = {
        status: "fail",
        message: "An unexpected server error occurred while processing the request.",
        error_details: error.message, // Provide error message
        // Optionally include stack trace for debugging (remove or secure in production)
        // stack_trace: error.stack,
        query: clientIp || null,
      };
      // Return a 500 Internal Server Error status
      return new Response(JSON.stringify(errorResponse, null, 2), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};