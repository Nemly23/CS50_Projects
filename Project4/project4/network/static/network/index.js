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
      posts.forEach(create_post, npages, current)
      pag_nav (npages, current);
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

  post.appendChild(header);

  if (content.owns) {
    const post_edit = document.createElement('textarea');
    post_edit.className = 'post-edit p-3 mx-0 mb-1 col-12';
    post_edit.maxlength = 240;
    post_edit.style.display = 'none';
    post.appendChild(post_edit);
    const edit = document.createElement('input');
    edit.className = 'edit-btn btn btn-secondary';
    edit.value = "Edit";
    const cancel = document.createElement('input');
    cancel.className = 'cancel-btn btn btn-danger';
    cancel.value = "Cancel";
    cancel.style.display = 'none';
    cancel.onclick = e => {
      const el = e.target;
      const this_edit =  el.parentElement.getElementsByClassName("edit-btn")[0];
      const this_post = el.parentElement.parentElement;
      const this_body =  this_post.getElementsByClassName("post-body")[0];
      const post_edit =  this_post.getElementsByClassName("post-edit")[0];
      this_body.style.display = 'block';
      post_edit.style.display = 'none';
      this_edit.className = 'edit-btn btn btn-primary';
      this_edit.value = "Edit";
      this_edit.style.width = "60px";
      el.style.display = 'none';
    }

    edit.onclick = e => {
      const el = e.target;
      const this_cancel =  el.parentElement.getElementsByClassName("cancel-btn")[0];
      const this_post = el.parentElement.parentElement;
      const this_body =  this_post.getElementsByClassName("post-body")[0];
      const post_edit =  this_post.getElementsByClassName("post-edit")[0];
      if (el.value == "Save") {
        const post_url = "/posts/" + content.id;
        fetch(post_url, {
          method: 'PUT',
          body: JSON.stringify({
              edit: post_edit.value
          })
        }).then(response => response.json())
        .then(message => {
          console.log(message);
          this_body.innerHTML =   post_edit.value;
          this_body.style.display = 'block';
          post_edit.style.display = 'none';
          el.className = 'edit-btn btn btn-primary';
          el.value = "Edit";
          el.style.width = "60px";
          this_cancel.style.display = 'none';
        });
      }
      else {
        el.className = 'edit-btn btn btn-success';
        el.value = "Save";
        el.style.width = "80px";
        post_edit.value = this_body.innerHTML;
        post_edit.style.display = 'block';
        this_body.style.display = 'none';
        this_cancel.style.display = 'block';
      }
    };
    header.appendChild(cancel);
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
    like_button.onclick = e => {
      const el = e.target;
      if (el.classList.contains('img-like')) {
        like_toggle(el, true, like_button.dataset.post_id);
      }
      else {
        like_toggle(el, false, like_button.dataset.post_id);
      }
    };
  }
  else {
    like_button.className = 'img-disable d-inline-block ml-2';
    nlikes.className = 'number-likes d-inline-block';
  }


  icons.appendChild(nlikes);
  icons.appendChild(like_button);


  post.appendChild(body);
  post.appendChild(timestamp);
  post.appendChild(icons);

  // Add post to DOM.
  document.querySelector('#post-view').append(post);
}

function edit_post (el) {
  const this_post = el.parentElement.parentElement;
  el.className = 'edit-btn btn btn-success';
  el.value = "Save";
  el.style.width = "80px";
  const this_body =  this_post.getElementsByClassName("post-body")[0];
  const post_edit = document.createElement('textarea');
  post_edit.className = 'post-edit p-3 mx-0 mb-1 col-12';
  post_edit.value = this_body.innerHTML;
  post_edit.maxlength = 240;
  this_post.insertBefore(post_edit, this_body)
  this_body.style.display = 'none';
}

function like_toggle(el, like, post_id){
  const post_url = "/posts/" + post_id;
  fetch(post_url, {
    method: 'PUT',
    body: JSON.stringify({
        like: like
    })
  }).then(response => response.json())
  .then(message => {
      // Print result
      console.log(message);
      const num_likes =  el.parentElement.children[0];
      if (like){
        num_likes.innerHTML = parseInt(num_likes.innerHTML, 10) + 1;
        el.className = 'img-liked d-inline-block ml-2';
        num_likes.className = 'number-liked d-inline-block';
      }
      else {
        num_likes.innerHTML = parseInt(num_likes.innerHTML, 10) - 1;
        el.className = 'img-like d-inline-block ml-2';
        num_likes.className = 'number-likes d-inline-block';
      }

  });
}

function pag_nav(npages, current) {
  console.log(npages)
  console.log(current)
  const pag_link = [1,2,3,4,5];
  if (npages <= 5) {
    for (const link of pag_link){
      if (link > npages) {
          document.querySelector(`#link_${link}`).style.display = 'none';
      }
      else {
        if (link == current){
          nav_link (link, link, npages, true)
        }
        else {
          nav_link (link, link, npages)
        }
      }
    }
  }
  else {
    if (current <= 2) {
      for (const link of pag_link){
        if (link == current){
          nav_link (link, link, npages, true)
        }
        else {
          nav_link (link, link, npages)
        }
      }
      nav_link (5, 0)
    }
    else if ((npages-current+1) <= 2){
      for (const link of pag_link){
        document.querySelector(`#link_${link}`).style.display = 'block';
        if ((npages+link-5) == current){
          nav_link (link, (npages+link-5), npages, true)
        }
        else {
          nav_link (link, (npages+link-5), npages)
        }
      }
      nav_link (1, 0, npages)
    }
    else {
      nav_link (1, 0, npages)
      nav_link (2, (current-1), npages)
      nav_link (3, current, npages)
      nav_link (4, (current+1), npages)
      nav_link (5, 0, npages)
    }
  }
  if (current == 1){
    document.querySelector("#previous").className = "page-item disabled";
  }
  else {
    document.querySelector("#previous").className = "page-item";
    document.querySelector("#previous").onclick = () => {
      load_page(npages, current-1);
    }
  }
  if (current == npages){
    document.querySelector("#next").className = "page-item disabled";
  }
  else {
    document.querySelector("#next").className = "page-item";
    document.querySelector("#next").onclick = () => {
      load_page(npages, current+1);
    }
  }
}

function nav_link (link_num, pag, npages, is_current = false) {
  const link = document.querySelector(`#link_${link_num}`)
  link.style.display = 'block';
  if (pag == 0){
    link.children[0].innerHTML = "...";
    link.className = "page-item";
  }
  else {
    if (is_current) {
      link.children[0].innerHTML = `${pag}<span class="sr-only">(current)</span>`;
      link.className = "page-item active";
    }
    else {
      link.children[0].innerHTML = pag.toString();
      link.className = "page-item";
      link.onclick = () => {
        load_page(npages, pag);
      }
    }
  }
}
