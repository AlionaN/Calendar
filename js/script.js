'use strict';

window.addEventListener('DOMContentLoaded', () => {

    const members = ["Maria", "Sergey", "Aliona", "Oleg", "Boryslav"];

    const eventCell = document.querySelectorAll('.event_cell');
    eventCell.forEach(item => {
        item.setAttribute('data-dropcont', 'true');
    });
    
    // General Functions

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

    async function putObject(url, data){
        return await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
            },
            body: data
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
        event.setAttribute('draggable', 'true');

        const crossBtn = document.createElement('span');
        crossBtn.classList.add('cross');
        event.append(crossBtn);
        input.append(event);
    }
    
    function createErrorElement(errorTitleText, container){
        const error = document.createElement('div');
        error.classList.add('error');
        const errorIcon = document.createElement('div');
        errorIcon.classList.add('error__icon');
        errorIcon.textContent = '×';
        const errorTitle = document.createElement('div');
        errorTitle.classList.add('error__title');
        errorTitle.textContent = errorTitleText;
        error.append(errorIcon);
        error.append(errorTitle);
        document.querySelector(container).prepend(error);
    }

    function createModal(event){
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `<div class="modal__dialog">
            <div class="modal__content">
                <div class="modal__close">×</div>
                <form action="#">
                    <div class="modal__title">
                        Are you sure you want to delete "${event}" event?
                    </div>
                    <div class="modal__buttons">
                        <button class="modal__button" data-delete="no">No</button>
                        <button class="modal__button" data-delete="yes">Yes</button>
                    </div>
                </form>
            </div>
        </div>`;
        document.querySelector('script').before(modal);
    }

    function removeModal(modal){
        modal.remove();        
    }

    function deleteEvent(){
        const oldModal = document.querySelectorAll('.modal');
        if(oldModal.length != 0){
            oldModal.forEach(item => item.remove());
        }
        

        const crossBtns = document.querySelectorAll('.cross');
        crossBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                createModal(e.target.closest('.event').textContent);

                const modal = document.querySelector('.modal');
                
                modal.addEventListener('click', (e) => {
                    if(e.target === modal || e.target.classList.contains('close')){
                        removeModal(modal);
                    };
                });

                const noBtn = modal.querySelector('[data-delete="no"]');
                noBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    removeModal(modal);
                });

                const yesBtn = modal.querySelector('[data-delete="yes"]');
                yesBtn.addEventListener('click', (e) => {
                    e.preventDefault(modal);

                    const thisEventID = btn.closest('.event');
                    const dataToDelete = thisEventID.getAttribute('data-id');
                    
                    deleteObject(`http://localhost:3000/events`, dataToDelete)
                    .then(() => {
                        window.location.reload();
                    });

                    removeModal(modal);
                });
            }); 
        });
    }

    function dragDrop(){
        const draggableElements = document.querySelectorAll('[draggable="true"]'),
              dragContainer = document.querySelector('.calendar');

        draggableElements.forEach(element => {
            element.addEventListener('dragstart', (e) => {
                e.target.classList.add('selected');
            });

            dragContainer.addEventListener('dragover', (e) => {
                e.preventDefault();

                const activeElement = document.querySelector('.selected'),
                      currentElement = e.target;

                let isMoveable = activeElement !== currentElement && currentElement.getAttribute('data-dropcont') == "true" && currentElement.childNodes.length === 0;
                
                if(!isMoveable){
                    return;
                }

                activeElement.setAttribute('data-day', currentElement.getAttribute('data-slot').substring(0, 3));
                activeElement.setAttribute('data-time', currentElement.getAttribute('data-slot').slice(-2));
                currentElement.append(activeElement);

                const idToPut = activeElement.getAttribute('data-id');
                
                putObject(`http://localhost:3000/events/${idToPut}`, JSON.stringify({
                    id: idToPut,
                    name: activeElement.textContent,
                    participants: activeElement.getAttribute('data-members'),
                    day: activeElement.getAttribute('data-day'),
                    time: activeElement.getAttribute('data-time')
                }));
                return false;
            });

            element.addEventListener('dragend', (e) => {
                e.target.classList.remove('selected');
            });
        });
    }

    // Calendar Page

    if(document.querySelector('.calendar')){

        createOptions(members, '.header__filter');
            
        getResource('http://localhost:3000/events')
            .then(data => {
                data.forEach(item => {
                    createEventVisual(item.name, item.participants, item.day, item.time, item.id, `[data-slot=${item.day}${item.time}]`);
                });
            })
            .then(() => {
                deleteEvent();
                dragDrop();               
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
                deleteEvent();
                dragDrop();
            });
        });

        const newEventBtn = document.querySelector('.header__new-event-btn');
        newEventBtn.addEventListener('click', (e) => {
            e.preventDefault();

            window.location = 'new-event.html';
        });
    }

    // Add New Event Page

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

                const errorBlocks = document.querySelectorAll('.error');
                if(errorBlocks.length != 0){
                    errorBlocks.forEach(item => {
                        item.remove();
                    });
                }

                const inputName = form.querySelector('.newevent__name-input'),
                      selectParticipans = form.querySelectorAll('.newevent__memb-select option:checked');
                if(inputName.value.length == 0){
                    createErrorElement('Please, input event name', '[for="event-name"]');
                    document.querySelector('.error').classList.add('show-flex');
                } else if(selectParticipans.length < 2){
                    createErrorElement('Please, choose 2 or more participants', '[for="participants"]');
                    document.querySelector('.error').classList.add('show-flex');
                } else{
                    const formData = new FormData(form);

                    const participantsOptions = document.querySelectorAll('.newevent__memb-select option:checked');
                    const participantsArray = [];
                    participantsOptions.forEach(item => {
                        participantsArray.push(item.value);
                    });
                    formData.append('participants', participantsArray);

                    const formDataToObject = Object.fromEntries(formData.entries());
                    const formDataDayTime = `${formDataToObject.day}${formDataToObject.time}`;
                    if (dayTimeArray.indexOf(formDataDayTime) != -1){
                        createErrorElement('Failed to create an event. Time slot is already booked', 'form');
                        document.querySelector('form > .error').classList.add('show-flex');
                        document.querySelector('form > .error').classList.remove('hide');
                    } else{
                        const json = JSON.stringify(Object.fromEntries(formData.entries()));
                    
                        postData('http://localhost:3000/events', json, 'POST')
                        .then(data => {   
                            window.location = 'index.html';
                        });
                    }
                }
            });
        }
    }
});