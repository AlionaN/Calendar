'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const members = ["Maria", "Sergey", "Aliona", "Oleg", "Boryslav"];
    let deleteBtns = '';

    const filter = document.querySelector('.header__filter');
    members.forEach((item) => {
        const memberOption = document.createElement('option');
        memberOption.value = item;
        memberOption.textContent = item;
        filter.append(memberOption);
    });

    function removeAllEvents(selector){
        const container = document.querySelectorAll(selector);
        container.forEach((item) => {
            item.childNodes.forEach(child => {
                child.remove();
            });
        });
    }

    function createEventVisual(eventName, members, day, time, inputSelector) {
        const membersString = members.reduce((prev, current) => {
            return `${prev}, ${current}`;
        });

        const input = document.querySelector(inputSelector);      

        const event = document.createElement('div');
        event.classList.add('event');
        event.textContent = eventName;
        event.setAttribute('data-members', membersString);
        event.setAttribute('data-day', day);
        event.setAttribute('data-time', time);

        const crossBtn = document.createElement('span');
        crossBtn.classList.add('cross');
        event.append(crossBtn);

        input.append(event);
    }

    const getResource = async (url) => {
        const result = await fetch(url);

        if(!result.ok){
            throw new Error(`Could not fetch ${url}, status: ${result.status}`);
        }

        return await result.json();
    }

    getResource('http://localhost:3000/events')
        .then(data => {
            data.forEach(item => {
                createEventVisual(item.name, item.participants, item.day, item.time, `[data-slot=${item.day}${item.time}]`);
            });
            deleteBtns = document.querySelectorAll('.calendar .cross');
            deleteBtns.forEach(btn => {
                deleteData(btn);
            });
        });

    filter.addEventListener('change', function() {
        getResource('http://localhost:3000/events')
        .then(data => {
            removeAllEvents('[data-slot]');
            data.forEach(item => {
                if(item.participants.indexOf(this.value) != -1 || this.value === 'all'){
                    createEventVisual(item.name, item.participants, item.day, item.time, `[data-slot=${item.day}${item.time}]`);
                }
            });
            deleteBtns = document.querySelectorAll('.calendar .cross');
            deleteBtns.forEach(btn => {
                deleteData(btn);
            });
        });
    });

    const postData = async (url, data, method) => {
        const result = await fetch(url, {
            method: method,
            headers: {
                'Content-type': 'application/json',
            },
            body: data,
        });
        return await result.json();
    };

    function deleteData(btns){
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                postData('http://localhost:3000/events', btn.closest('.event'), 'DELETE')
                 .then(data => {
                     console.log(data);
                 })

            });
        });
    }
    
});