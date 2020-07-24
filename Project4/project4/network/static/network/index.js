document.addEventListener('DOMContentLoaded', function() {
  var npages;
  var current = 1;

  load_posts(following = false, npages, current);

  document.querySelector('#compose-post').onsubmit = () => {

      const body = document.querySelector('#compose-body').value;

      fetch('/create_post', {
        method: 'POST',
        body: JSON.stringify({
            body: body
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
          document.querySelector('#compose-body').value = "";
      });
      // Stop form from submitting
      return false;
  };

});

function load_posts(following = false, npages, current) {

  fetch('/load_posts', {
    method: 'POST',
    body: JSON.stringify({
        following: following
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      npages = result.npages;
      current = 1;
      load_page(npages, current);
  });
}

function load_page(npages, current) {
  fetch('/get_page', {
    method: 'POST',
    body: JSON.stringify({
        page: current
    })
  })
  .then(response => response.json())
  .then(posts => {
      // Print result
      console.log(posts);
  });
}
