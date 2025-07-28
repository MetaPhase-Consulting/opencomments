@@ .. @@
     FROM dockets d
     LEFT JOIN agencies a ON a.id = d.agency_id
     LEFT JOIN (
-      SELECT docket_id, COUNT(*) as comment_count
+      SELECT c.docket_id, COUNT(*) as comment_count
       FROM comments c
-      WHERE status = 'published'
-      GROUP BY docket_id
+      WHERE c.status = 'published'
+      GROUP BY c.docket_id
     ) cc ON cc.docket_id = d.id
     WHERE d.status IN ('open', 'closed')
       AND (p_status IS NULL OR d.status = p_status)