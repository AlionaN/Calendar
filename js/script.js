'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const members = ["Maria", "Sergey", "Aliona", "Oleg", "Boryslav"];

    function removeAllEvents(selector){
        const container = document.querySelectorAll(selector);
        container.forEach((item) => {
            item.childNodes.forEach(child => {
                child.remove();
            });
        });
    }
    function createOptions(optionsArray, container){
        const select = document.querySelector(container);
        optionsArray.forEach((item) => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.append(option);
        });
    }

    const getResource = async (url) => {
        const result = await fetch(url);

        if(!result.ok){
            throw new Error(`Could not fetch ${url}, status: ${result.status}`);
        }

        return await result.json();
    }

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
    async function deleteObject(url, data){
        return await fetch(url + '/' + data ,{
            method: 'DELETE',
        })
        .then(response => response.json());
    }
    function createEventVisual(eventName, members, day, time, id, inputSelector) {

        const input = document.querySelector(inputSelector);      

        const event = document.createElement('div');
        event.classList.add('event');
        event.textContent = eventName;
        event.setAttribute('data-members', members);
        event.setAttribute('data-day', day);
        event.setAttribute('data-time', time);
        event.setAttribute('data-id', id);

        const crossBtn = document.createElement('span');
        crossBtn.classList.add('cross');
        event.append(crossBtn);
        input.append(event);
          
    }
    
    if(document.querySelector('.calendar')){

        createOptions(members, '.header__filter');
            
        getResource('http://localhost:3000/events')
            .then(data => {
                data.forEach(item => {
                    createEventVisual(item.name, item.participants, item.day, item.time, item.id, `[data-slot=${item.day}${item.time}]`);
                });
            })
            .then(() => {
                const crossBtns = document.querySelectorAll('.cross');
                crossBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const thisEventID = btn.closest('.event');
                        const dataToDelete = thisEventID.getAttribute('data-id');
                        
                        deleteObject(`http://localhost:3000/events`, dataToDelete)
                        .then(data => {
                            console.log(data);
            
                            window.location.reload();
                        });
                    }); 
                });
                
            });

        const filter = document.querySelector('.header__filter');
        filter.addEventListener('change', function() {
            getResource('http://localhost:3000/events')
            .then(data => {
                removeAllEvents('[data-slot]');
                data.forEach(item => {
                    if(item.participants.split(',').indexOf(this.value) != -1 || this.value === 'all'){
                        createEventVisual(item.name, item.participants, item.day, item.time, item.id, `[data-slot=${item.day}${item.time}]`);
                    }
                });
            }).then(() => {
                const crossBtns = document.querySelectorAll('.cross');
                crossBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const thisEventID = btn.closest('.event');
                        const dataToDelete = thisEventID.getAttribute('data-id');
                        
                        deleteObject(`http://localhost:3000/events`, dataToDelete)
                        .then(data => {
                            console.log(data);
            
                            window.location.reload();
                        });
                    }); 
                });
                
            });
        });

        const newEventBtn = document.querySelector('.header__new-event-btn');
        newEventBtn.addEventListener('click', (e) => {
            e.preventDefault();

            window.location = 'new-event.html';
        });
    }

    if(document.querySelector('.newevent')){
        createOptions(members, '#participants');

        const forms = document.querySelectorAll('form');

        forms.forEach(item => {
            bindPostData(item);
        });

        
        let dayTimeArray = [];
        getResource('http://localhost:3000/events')
        .then(data => {
            data.forEach(item => {
                const r = `${item.day}${item.time}`;
                dayTimeArray.push(r);
            });
        });

        function bindPostData(form){
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = new FormData(form);
                const participantsOptions = document.querySelectorAll('.newevent__memb-select option:checked');
                const participantsArray = [];
                participantsOptions.forEach(item => {
                    participantsArray.push(item.value);
                });
                console.log(participantsArray);
                formData.append('participants', participantsArray);
                const formDataToObject = Object.fromEntries(formData.entries());
                const formDataDayTime = `${formDataToObject.day}${formDataToObject.time}`;
                if (dayTimeArray.indexOf(formDataDayTime) != -1){
                    document.querySelector('.error').classList.add('show-flex');
                    document.querySelector('.error').classList.remove('hide');
                } else{
                    const json = JSON.stringify(Object.fromEntries(formData.entries()));
                    console.log(json.name);
                    postData('http://localhost:3000/events', json, 'POST')
                    .then(data => {
                        console.log(data);
    
                        window.location = 'index.html';
                    });
                }
                
            });
        }
    }

    // const deleteBtns = document.querySelectorAll('.calendar .cross');

    // const postData = async (url, data, method) => {
    //     const result = await fetch(url, {
    //         method: method,
    //         headers: {
    //             'Content-type': 'application/json',
    //         },
    //         body: data,
    //     });
    //     return await result.json();
    // };

    // function deleteData(btns){
    //     btns.forEach(btn => {
    //         btn.addEventListener('click', (e) => {
    //             e.preventDefault();

    //             postData('http://localhost:3000/events', btn.closest('.event'), 'DELETE')
    //              .then(data => {
    //                  console.log(data);
    //              })

    //         });
    //     });
    // }
    // deleteBtns.forEach(btn => {
    //     deleteData(btn)
    // });
});