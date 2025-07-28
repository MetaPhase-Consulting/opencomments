@@ .. @@
 CREATE OR REPLACE FUNCTION get_public_dockets(
   p_search_query text DEFAULT NULL,
   p_tags text[] DEFAULT NULL,
   p_status text DEFAULT 'open',
   p_limit integer DEFAULT 20,
   p_offset integer DEFAULT 0
 )
 RETURNS TABLE (
   id uuid,
   title text,
   summary text,
   slug text,
   tags text[],
   status text,
   open_at timestamptz,
   close_at timestamptz,
   comment_count bigint,
   agency_name text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 AS $$
 BEGIN
   RETURN QUERY
   SELECT 
-    id,
-    title,
-    summary,
-    slug,
-    tags,
-    status,
-    open_at,
-    close_at,
+    d.id,
+    d.title,
+    d.summary,
+    d.slug,
+    d.tags,
+    d.status,
+    d.open_at,
+    d.close_at,
     COALESCE(comment_counts.count, 0) as comment_count,
-    agency_name
+    a.name as agency_name
   FROM dockets d
-  LEFT JOIN agencies ON agencies.id = d.agency_id
+  LEFT JOIN agencies a ON a.id = d.agency_id
   LEFT JOIN (
     SELECT 
       docket_id,
       COUNT(*) as count
     FROM comments 
-    WHERE status = 'published'
+    WHERE comments.status = 'published'
     GROUP BY docket_id
   ) comment_counts ON comment_counts.docket_id = d.id
   WHERE 
-    (status = 'open' OR status = 'closed')
+    (d.status = 'open' OR d.status = 'closed')
     AND (p_status IS NULL OR p_status = 'all' OR d.status = p_status)
     AND (p_tags IS NULL OR d.tags && p_tags)
     AND (
       p_search_query IS NULL 
       OR d.search_vector @@ plainto_tsquery('english', p_search_query)
-      OR title ILIKE '%' || p_search_query || '%'
-      OR summary ILIKE '%' || p_search_query || '%'
+      OR d.title ILIKE '%' || p_search_query || '%'
+      OR d.summary ILIKE '%' || p_search_query || '%'
     )
   ORDER BY 
-    CASE WHEN status = 'open' THEN 0 ELSE 1 END,
-    created_at DESC
+    CASE WHEN d.status = 'open' THEN 0 ELSE 1 END,
+    d.created_at DESC
   LIMIT p_limit
   OFFSET p_offset;
 END;
 $$;