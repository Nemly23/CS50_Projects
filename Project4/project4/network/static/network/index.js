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
      posts.forEach(create_post)
  });
}

function create_post (content) {
  var post = document.createElement('div');
  post.className = 'post col-lg-8 col-md-12 my-2 mx-auto border border-dark rounded p-0';
  post.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'post-header border-bottom border-dark pl-4 pr-2 py-2 m-0';
  header.innerHTML = content.owner;
  if (content.owns) {
    const edit = document.createElement('input');
    edit.className = 'edit-btn btn btn-secondary';
    edit.value = "Edit";
    edit.onclick = () => {};
    header.appendChild(edit);
  }

  const body = document.createElement('div');
  body.className = 'post-body p-3 mx-0 mb-1';
  body.innerHTML = content.body;

  const timestamp = document.createElement('div');
  timestamp.className = 'post-timestamp pl-3 m-0';
  timestamp.innerHTML = content.timestamp;

  const icons = document.createElement('div');
  icons.className = 'post-icons pl-3 py-1 m-0';
  icons.innerHTML = '';

  const nlikes = document.createElement('div');
  nlikes.className = 'number-likes d-inline-block';
  nlikes.innerHTML = content.likes;

  const like_button = document.createElement('img');
  like_button.height = 20;
  if (document.querySelector('#user') != null) {
    if (content.liked){
      like_button.className = 'img-liked d-inline-block ml-2';
    }
    else {
      like_button.className = 'img-like d-inline-block ml-2';
    }
  }
  else {
    like_button.className = 'img-disable d-inline-block ml-2';
  }
  like_button.dataset.post_id = content.id;
  like_button.onclick = () => {};

  icons.appendChild(nlikes);
  icons.appendChild(like_button);



  post.appendChild(header);
  post.appendChild(body);
  post.appendChild(timestamp);
  post.appendChild(icons);

  // Add post to DOM.
  document.querySelector('#post-view').append(post);
}
