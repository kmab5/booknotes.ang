document.addEventListener('DOMContentLoaded', () => {
    const addNote = document.querySelector(".add-note");
    const edits = document.querySelectorAll(".edit");
    const ratingIcons = document.querySelector(".rating");
    const favoriteIcon = document.querySelector(".favorite");
    const rating = document.querySelector("#rating");
    const favorite = document.querySelector("#favorite");
    const progress = document.querySelector("#progress");
    const update = document.querySelector(".update");
    const id = document.querySelector("#bookid").value.slice(1);
    
    // so the thoughts are to handle the entire /update route using this js to funnel all the info (new note, edit note, delete note, edit favorite, edit rating) straight to the route everytime something changes

    display_rating();

    progress.addEventListener('change', () => {
        update.classList.remove("hidden");
    });

    favoriteIcon.addEventListener('click', () => {
        update.classList.remove("hidden");
        favorite.value = favorite.value == 'true' ? 'false' : 'true';
        if (favorite.value == 'true') favoriteIcon.classList.add('active-icon');
        else favoriteIcon.classList.remove('active-icon');
    });

    ratingIcons.addEventListener('click', (e) => {
        update.classList.remove("hidden");
        let rate = 0;
        let buffer = e.target.getBoundingClientRect().height * 0.5 / 1.8;
        let gap = buffer + e.target.getBoundingClientRect().height;
        if (e.currentTarget === e.target) {
            rate = (Math.floor(e.offsetX / gap) + 1) * 2;
        } else {
            rate = (parseInt(e.target.title) - 1) * 2;
            if (e.offsetX < e.target.getBoundingClientRect().width / 2) rate += 1;
            else rate += 2;
        }
        rating.value = (rate / 2).toString();
        display_rating();
    });

    ratingIcons.addEventListener('mousemove', e => {
        let rate = 0;
        let buffer = e.target.getBoundingClientRect().height * 0.5 / 1.8;
        let gap = buffer + e.target.getBoundingClientRect().height;
        if (e.currentTarget === e.target) {
            rate = (Math.floor(e.offsetX / gap) + 1) * 2;
        } else {
            rate = (parseInt(e.target.title) - 1) * 2;
            if (e.offsetX < e.target.getBoundingClientRect().width / 2) rate += 1;
            else rate += 2;
        }
        display_rating(rate);
    });

    ratingIcons.addEventListener('mouseout', () => display_rating());

    addNote.addEventListener('click', () => {
        let note = document.createElement('form');
        note.classList.add('list-item', 'note');
        note.setAttribute('method', 'post');
        note.setAttribute('action', '/update');
        note.innerHTML = `<input type="hidden" name="id" value="n000b${id}"><textarea name="note" class="underline" id="newnote" placeholder="Enter note here..." autofocus required></textarea><div class="title-bar"><h4 class="subtext">Entry Page: <span class="normal"><input class="normal" type="number" name="page" required/></span></h4><div class="button-group"><button type="submit" name="mode" value="new" class="add colored done"><span class="material-symbols-rounded icon add-icon" title="Save">save</span>Save</button></div></div>`;
        document.querySelector(".list").firstChild.before(note);
        document.querySelector("#newnote").focus();
    });

    edits.forEach(edit => {
        edit.addEventListener('click', e => {
            const parent = edit.parentElement.parentElement.parentElement;
            edit.classList.add("hidden");
            parent.getElementsByTagName("textarea")[0].removeAttribute('disabled');
            parent.getElementsByTagName("textarea")[0].focus();
            parent.getElementsByTagName("textarea")[0].classList.add('underline');
            parent.getElementsByClassName("done")[0].classList.remove('hidden');
        });
    });

    function display_rating(custom = null) {
        // 0 - (1, 2) | 1 - (3, 4) | 2 - (5, 6) | 3 - (7, 8) | 4 - (9, 10)
        let rate = custom || parseInt(parseFloat(rating.value) * 2);
        ratingIcons.childNodes.forEach(child => {
            child.innerHTML = 'star';
            child.classList.remove('active-icon');
        });
        for(let i = 0; i < Math.floor(rate / 2); i++) {
            ratingIcons.childNodes[i].innerHTML = 'star';
            ratingIcons.childNodes[i].classList.add("active-icon");
        }
        if (rate % 2 == 1) ratingIcons.childNodes[Math.floor(rate / 2)].innerHTML = 'star_half';
    }
});