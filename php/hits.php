<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="author" content="kiddspazz">
    <title>template</title>
  </head>

  <header></header>
  <body>
    <main>
    <div>
      <p style="text-align: center;">Number of visitors: 
        <?php
          // Connecting, selecting database
          $dbconn = pg_connect("dbname = 'th'")
            or die('Could not connect: ' . pg_last_error());

          // Performing SQL query
          $query = 'UPDATE hit_counter SET count=count+1 RETURNING count';
          $result = pg_query($query) or die('Query failed: ' . pg_last_error());

          $count_results = pg_fetch_assoc($result);
          echo $count_results["count"];

          // Free result set
          pg_free_result($result);

          // Closing connection
          pg_close($dbconn);
        ?>
      </p>
    </div>
    </main>
  </body>
  <footer></footer>
</html>
