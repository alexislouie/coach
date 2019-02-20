if (!bearer) {
    $('main').html(`
        <div class="unauthorized">
            <b>ERROR 404</b> unauthorized<br />
            <span class="login">Please <a href="/login.html">log in to view</a></span>
        </div>
    `);
}

if (bearer) {
    $('header ul').html('<li>Log Out</li>');
    $('header').on('click', 'li', function(event) {
        // event.preventDefault();
        window.location.replace('/index.html');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
    })
}