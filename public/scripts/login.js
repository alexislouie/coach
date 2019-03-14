const bearer = localStorage.getItem('authToken');
const id = localStorage.getItem('userId');

function handleLogin() {
    $('body').on('click', '.js-login-button', function (event) {
        event.preventDefault();

        const user = {};
        user['username'] = $('#login-username').val();
        user['password'] = $('#login-password').val();

        loginUser(user);
    })
}

function loginUser(user) {
    fetch('/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                // throw Error(`Request rejected with status ${res.status}`);
                $('.form-header').after(`<div class="errors">Invalid username or password</div>`)
            }
        })
        .then(res => {
            localStorage.setItem('authToken', res.authToken);
            localStorage.setItem('userId', res.userId);
            return window.location.replace('/profile.html');
        })

}

handleLogin();