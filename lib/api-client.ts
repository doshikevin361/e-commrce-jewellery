/**
 * API Client utility with automatic logout on unauthorized errors
 * This wraps fetch and handles 401/403 responses by logging out the user
 */

export interface ApiClientOptions extends RequestInit {
  skipAuthCheck?: boolean; // Set to true to skip automatic logout on 401/403
}

/**
 * Logout function that clears tokens and redirects to login
 */
export const handleUnauthorized = () => {
  // Clear admin tokens
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // Clear customer tokens (if any)
  localStorage.removeItem('customerToken');
  localStorage.removeItem('currentUser');
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Enhanced fetch wrapper that automatically handles unauthorized errors
 * @param url - The URL to fetch
 * @param options - Fetch options (same as native fetch)
 * @returns Promise<Response>
 */
export async function apiFetch(
  url: string | URL | Request,
  options: ApiClientOptions = {}
): Promise<Response> {
  const { skipAuthCheck = false, ...fetchOptions } = options;
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Check for unauthorized errors (401 or 403)
    if (!skipAuthCheck && (response.status === 401 || response.status === 403)) {
      // Check if this is an admin API call
      const urlString = typeof url === 'string' ? url : url.toString();
      if (urlString.includes('/api/admin/') || urlString.includes('/api/auth/')) {
        console.warn('[API Client] Unauthorized access detected, logging out...');
        handleUnauthorized();
        // Return the response anyway so the caller can handle it if needed
      }
    }
    
    return response;
  } catch (error) {
    console.error('[API Client] Fetch error:', error);
    throw error;
  }
}

