document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#message').style.display = 'none';
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(''));

  // By default, load the inbox
  load_mailbox('inbox');


  document.querySelector('#compose-view').onsubmit = () => {

      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
          if (result.error) {
            document.querySelector('#message').innerHTML = result.error;
            document.querySelector('#message').style.display = 'block';
            document.querySelector('#message').style.color = 'Red';
          }
          else {
            compose_email(result.message);
            load_mailbox('inbox');
          }
      });
      // Stop form from submitting
      return false;
  };

});

function compose_email(message='') {


  document.querySelector('#message').innerHTML = message;
  if (message) {
    document.querySelector('#message').style.display = 'block';
    document.querySelector('#message').style.color = 'Green';
  }
  else{
    document.querySelector('#message').style.display = 'none';
  }
  // Show compose view and hide other views
  document.querySelector('#open-email').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}

function load_mailbox(mailbox) {

  document.querySelector('#emails-messages').textContent = '';
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-title').innerHTML = `<h3>${mailbox.toUpperCase()}</h3>`;
  const box = mailbox;
  url_mailbox = '/emails/' + mailbox
  fetch(url_mailbox)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      emails.reverse();
      console.log(emails);
      console.log(mailbox);
      emails.forEach(function(mail) { mail["mailbox"] = mailbox; });
      emails.forEach(add_email);
      // ... do something else with emails ...
  });

}


function add_email(content) {
    const mailbox = content.mailbox;
    // Create new post.
    var email = document.createElement('div');
    email.className = 'emails-info m-0 p-0 row';
    email.innerHTML = '';
    email.dataset.email_id = content.id;
    email.onclick = () => {
      const email_url = "/emails/" + email.dataset.email_id
      fetch(email_url)
      .then(response => response.json())
      .then(email => {
        // Print email
        console.log(email);
        open_email(email, mailbox);
        // ... do something else with email ...
      });
      if (mailbox != 'sent') {
        fetch(email_url, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }

    };

    const read = document.createElement('div');
    read.className = 'date col-1 m-0 p-2';
    if (mailbox == 'sent') {
      read.innerHTML = "";
    }
    else {
      if (content.read) {
        read.innerHTML = "Read";
        email.style.backgroundColor = 'LightGray';
      }
      else {
        read.innerHTML = "Not Read";
      }
    }


    const sender = document.createElement('div');
    sender.className = 'col-3 m-0 p-2 border-left';
    if (mailbox == 'sent') {
      sender.innerHTML = "To: " + content.recipients.join();
    }
    else {
      sender.innerHTML = content.sender;
    }


    const subject = document.createElement('div');
    subject.className = 'col-6 m-0 p-2 border-left';
    subject.innerHTML = content.subject;

    const timestamp = document.createElement('div');
    timestamp.className = 'date col-2 m-0 p-2 border-left';
    timestamp.innerHTML = content.timestamp;

    email.appendChild(read);
    email.appendChild(sender);
    email.appendChild(subject);
    email.appendChild(timestamp);

    // Add post to DOM.
    document.querySelector('#emails-messages').append(email);
}

function open_email(email, mailbox) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-email').style.display = 'block';


  if (mailbox == 'sent'){
    document.querySelector('#reply').style.display = 'none';
    document.querySelector('#archive').style.display = 'none';
  }
  else {
    document.querySelector('#reply').style.display = 'block';
    document.querySelector('#archive').style.display = 'block';
  }

  document.querySelector('#reply').onclick  = () => {
    compose_email('');
    document.querySelector('#compose-recipients').value = email.sender;
    var re = email.subject.replace(/ .*/,'');
    if (re == "Re:"){
      document.querySelector('#compose-subject').value = email.subject;
    }
    else {
      document.querySelector('#compose-subject').value = "Re: " + email.subject;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;
  }
  const email_url = "/emails/" + email.id

  if (email.archived) {
    document.querySelector('#archive').innerHTML = 'Unarchive';
    document.querySelector('#archive').onclick = () => {
      fetch(email_url, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      }).then(() => load_mailbox('inbox'));
    }
  }
  else {
    document.querySelector('#archive').innerHTML = 'Archive';
    document.querySelector('#archive').onclick = () => {
      fetch(email_url, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      }).then(() => load_mailbox('archive'));
    }
  }
  document.querySelector('#sender').innerHTML = email.sender;

  document.querySelector('#recipients').innerHTML = email.recipients.join();
  document.querySelector('#subject').innerHTML = email.subject;
  document.querySelector('#timestamp').innerHTML = email.timestamp;
  document.querySelector('#body-email').innerHTML = email.body;
}
