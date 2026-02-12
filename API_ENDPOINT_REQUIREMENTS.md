# API Endpoint Required for Admin Dashboard

The admin dashboard at `/admin` requires a new API endpoint to be implemented on the Python backend server.

## Endpoint Specification

**URL:** `GET /admin/cached-users`

**Authentication:** Basic Auth
- Username: `admin`
- Password: `P@sw0rd!1441`

**Response Format:**
```json
{
  "users": [
    {
      "username": "string",
      "account_age": "string (e.g., '5 years')",
      "comment_karma": number,
      "post_karma": number,
      "total_comments": number,
      "total_posts": number,
      "total_subreddits": number,
      "estimated_location": "string",
      "ai_gender": "string",
      "ai_age": "string or number",
      "language": "string (e.g., 'English', 'Spanish')",
      "pca_cluster": "string or number",
      "tsne_cluster": "string or number"
    }
  ]
}
```

## Implementation Notes

The endpoint should:
1. Check Basic Auth credentials against environment variables
2. Return all cached user data from Redis/database
3. Include AI analysis results (gender, age predictions)
4. Include language detection results
5. Include PCA and t-SNE clustering data if available

## Security

- Store credentials in environment variables on the server
- Validate authentication on every request
- Consider rate limiting for this endpoint
- Optionally add CORS restrictions for admin endpoints
