if (bearer) {
    $('header ul').html(`
        <a class="nav-link" href="/profile.html">PROFILE</a>
        <a class="nav-link" href="/search.html">SEARCH</a>
        <a class="nav-link" href="/create-program.html">UPLOAD</a>
        <a class="nav-link logout" href="/logout.html">LOG OUT</a>
        
        <div class="menu-icon">
            <div class="bar bar1"></div>
            <div class="bar bar2"></div>
            <div class="bar bar3"></div>
        </div>
  `);
    $('header .logout').click(function (event) {
        window.location.replace('/index.html');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
    })

    $('header').on('click', '.menu-icon', function (event) {
        event.preventDefault();
        $(this).toggleClass('rotate');

        $('header').toggleClass('grey-bg');
        if ($(this).hasClass('rotate')) {
            $('main').prepend(`
                <div class="dropdown-menu">
                    <li>
                        <a class="nav-link" href="/profile.html">PROFILE</a>
                    </li>
                    <li>
                        <a class="nav-link" href="/search.html">SEARCH</a>
                    </li>
                    <li>
                        <a class="nav-link" href="/create-program.html">UPLOAD</a>
                    </li>
                    <li>
                        <a class="nav-link logout" href="/logout.html">LOG OUT</a>
                    </li>
                </div>
            `)
        } else {
            $('.dropdown-menu').remove();
        }
    })
} else {
    $('header').on('click', '.menu-icon', function (event) {
        event.preventDefault();
        $(this).toggleClass('rotate');

        $('header').toggleClass('grey-bg');
        if ($(this).hasClass('rotate')) {
            $('main').prepend(`
                <div class="dropdown-menu">
                    <li>
                        <a class="nav-link" href="/signup.html">SIGN UP</a>
                    </li>
                    <li>
                        <a class="nav-link" href="/login.html">LOG IN</a>
                    </li>
                </div>
            `)
        } else {
            $('.dropdown-menu').remove();
        }
    })
}



