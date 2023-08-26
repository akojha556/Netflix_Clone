window.addEventListener("scroll", () => {
    const navBar = document.querySelector(".nav-bar");
    if (window.scrollY > 5) {
        navBar.classList.add("black-bg");
    } else {
        navBar.classList.remove("black-bg");
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const movieInfo = document.getElementById("movie-info");
    const maxWords = 60;

    const words = movieInfo.textContent.split(' ');

    if (words.length > maxWords) {
        movieInfo.textContent = words.slice(0, maxWords).join(' ') + '...';
    }

    const movieRow = document.querySelectorAll(".movie-row");
    const prevBtn = document.querySelectorAll(".prev-btn");
    const nextBtn = document.querySelectorAll(".next-btn");

    prevBtn.forEach((button, i) => {
        button.addEventListener("click", () => {
            movieRow[i].scrollLeft -= 800;
        });
    });

    nextBtn.forEach((button, i) => {
        button.addEventListener("click", () => {
            movieRow[i].scrollLeft += 800;
        });
    });
});
