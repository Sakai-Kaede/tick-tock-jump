let currentIndex1 = 0;
let currentIndex2 = 0;

function showSlide(index, sliderId) {
    const slideWidth = document.querySelector(`#${sliderId} .slide`).offsetWidth;
    const newPosition = -index * slideWidth;
    document.getElementById(sliderId).style.transform = `translateX(${newPosition}px)`;
}

function nextSlide(section) {
    if (section === 1) {
        currentIndex1 = (currentIndex1 + 1) % 3;
        showSlide(currentIndex1, 'slider-1');
    } else if (section === 2) {
        currentIndex2 = (currentIndex2 + 1) % 3;
        showSlide(currentIndex2, 'slider-2');
    }
}