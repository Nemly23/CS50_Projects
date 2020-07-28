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
          load_posts(following = false, npages, current);
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
      document.querySelector('#post-view').innerHTML = "";
      posts.reverse().forEach(create_post, npages, current)
  });
}

function create_post (content, npages, current) {
  var post = document.createElement('div');
  post.className = 'post col-lg-8 col-md-12 my-2 mx-auto border border-dark rounded p-0';
  post.innerHTML = '';

  const body = document.createElement('div');
  body.className = 'post-body p-3 mx-0 mb-1';
  body.innerHTML = content.body;

  const header = document.createElement('div');
  header.className = 'post-header border-bottom border-dark pl-4 pr-2 py-2 m-0';
  header.innerHTML = content.owner;
  if (content.owns) {
    const edit = document.createElement('input');
    edit.className = 'edit-btn btn btn-secondary';
    edit.value = "Edit";
    edit.onclick = e => {
      const el = e.target;
      const this_post = el.parentElement.parentElement;
      el.className = 'edit-btn btn btn-success';
      el.value = "Change";
      el.style.width = "80px";
      const this_body =  this_post.getElementsByClassName("post-body")[0];
      const post_edit = document.createElement('textarea');
      post_edit.className = 'post-edit  p-3 mx-0 mb-1 col-12';
      post_edit.value = this_post.getElementsByClassName("post-body")[0].innerHTML;
      post_edit.maxlength = 240;
      this_post.insertBefore(post_edit, this_body)
      this_body.style.display = 'none';
    };
    header.appendChild(edit);
  }

  const timestamp = document.createElement('div');
  timestamp.className = 'post-timestamp pl-3 m-0';
  timestamp.innerHTML = content.timestamp;

  const icons = document.createElement('div');
  icons.className = 'post-icons pl-3 py-1 m-0';
  icons.innerHTML = '';

  const nlikes = document.createElement('div');
  nlikes.innerHTML = content.likes;

  const like_button = document.createElement('img');
  like_button.height = 20;
  if (document.querySelector('#user') != null) {
    if (content.liked){
      like_button.className = 'img-liked d-inline-block ml-2';
      nlikes.className = 'number-liked d-inline-block';
    }
    else {
      like_button.className = 'img-like d-inline-block ml-2';
      nlikes.className = 'number-likes d-inline-block';
    }
    like_button.dataset.post_id = content.id;
    like_button.onclick = () => {
      const email_url = "/posts/" + like_button.dataset.post_id;
      fetch(email_url, {
        method: 'PUT',
        body: JSON.stringify({
            like: !content.liked
        })
      }).then(response => response.json())
      .then(message => {
          // Print result
          console.log(message);
          load_posts(following = false, npages, current);
      });
    };
  }
  else {
    like_button.className = 'img-disable d-inline-block ml-2';
    nlikes.className = 'number-likes d-inline-block';
  }


  icons.appendChild(nlikes);
  icons.appendChild(like_button);



  post.appendChild(header);
  post.appendChild(body);
  post.appendChild(timestamp);
  post.appendChild(icons);

  // Add post to DOM.
  document.querySelector('#post-view').append(post);
}

function edit_post (element) {

    document.querySelector('#edit-btn').value = "Change";
}
