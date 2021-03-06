// const data = [{ name: 'Max', money: 100, id: 1, difference: 10 }]
let globalData = [];

const SELECTORS = {
  personRow: 'person-row',
  moneyInput: 'money-input',
  removeBtn: 'remove-btn',
  nameBlock: 'name-block',
  personName: 'person-name',
  diff: 'person-diff',
  peopleList: 'people-list',
  newPersonInpt: 'new-person-input',
  addBtn: 'add-btn',
  clearBtn: 'clear-all-btn',
  content: 'content',
  peopleCounter: 'people-counter',
  errInput: 'red-input',
  modal: 'modal-window',
  modalVisible: 'modal-visible',
  modalContent: 'modal-window-content',
}


function PeopleItem(person, onKeyPress, onRemove) {
  this.person = person;

  this.getRow = () => {
    const row = document.createElement('div');
    row.className = SELECTORS.personRow;
    return row;
  }

  this.getInput = () => {
    const input = document.createElement('input');
    input.className = SELECTORS.moneyInput;
    input.type = 'number';
    input.value = this.person.money || '';
    input.addEventListener('keyup', onKeyPress);
    return input;
  }

  this.getDeleteButton = () => {
    const button = document.createElement('button');
    button.className = SELECTORS.removeBtn;
    button.innerHTML = 'X'
    button.value = this.person.id;
    button.addEventListener('click', onRemove)
    return button;
  }

  this.getName = () => {
    const nameDiv = document.createElement('div');
    nameDiv.className = SELECTORS.nameBlock;
    const name = document.createElement('div');
    const difference = document.createElement('div');
    name.className = SELECTORS.personName;
    name.innerHTML = person.name;
    difference.className = `${SELECTORS.diff} ${person.difference < 0 ? 'red' : 'green'}`;
    difference.innerHTML = person.difference > 0 ? `+${person.difference}` : person.difference;
    difference.id = `diff:${person.id}`
    nameDiv.appendChild(name);
    nameDiv.appendChild(difference);
    return nameDiv;
  }

  this.getControls = () => {
    const controls = document.createElement('div');
    controls.className = 'controls';
    controls.appendChild(this.getInput());
    controls.appendChild(this.getDeleteButton());
    return controls;
  }

  this.render = () => {
    const row = this.getRow();
    const controls = this.getControls();
    const name = this.getName();
    row.appendChild(name);
    row.appendChild(controls);
    return row;
  }
}


const showModal = ({ text, duration = 2500, }) => {
  const modal = document.getElementById(SELECTORS.modal);
  const modalContent = document.getElementById(SELECTORS.modalContent);
  modalContent.innerHTML = text;
  modal.classList.add(SELECTORS.modalVisible);
  setTimeout(() => modal.classList.remove(SELECTORS.modalVisible), duration)
}

const setInLocalStore = data => window.localStorage.setItem('data', JSON.stringify(data));

const renderPeople = ({ data, initRender }) => {
  if (!initRender) {
    setInLocalStore(data);
  }
  globalData = data;
  const peopleList = document.getElementById(SELECTORS.peopleList);
  document.getElementById(SELECTORS.peopleCounter).innerHTML = `(${data.length})`;
  peopleList.innerHTML = '';
  data.forEach(curPerson => {
    const handleKeyPress = ({ target }) => {
      curPerson.money = Number(target.value);
      const newData = calculateDifferences(data);
      displayDifferences(newData);
      setInLocalStore(newData);
    }

    const removePerson = ({ target: { value } }) => {
      const newData = data.filter(person => person.id !== Number(value));
      renderPeople({ data: newData });
    }

    const person = new PeopleItem(curPerson, handleKeyPress, removePerson);
    peopleList.append(person.render());
  })
}

const renderAddPersonBtn = () => {

  const addPerson = () => {
    const input = document.getElementById(SELECTORS.newPersonInpt);

    const fireInput = errMsg => {
      showModal({ text: errMsg, duration: 1500 })
      input.classList.add(SELECTORS.errInput);
      setTimeout(() => input.classList.remove(SELECTORS.errInput), 1500);
    }

    if (!input.value) {
      return fireInput('Can\'t be blank!');
    }

    const isExist = !!globalData.find(person => person.name.toLowerCase() === input.value.toLowerCase());
    if (isExist) {
      return fireInput('Person already added!');
    }

    const newData = [...globalData, { name: input.value.trim(), money: 0, difference: 0, id: Date.now() }];
    const calculatedData = calculateDifferences(newData);
    renderPeople({ data: calculatedData });
    displayDifferences(calculatedData);
    input.value = '';
    const list = document.getElementById(SELECTORS.peopleList);
    list.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
  }

  const addBtn = document.getElementById(SELECTORS.addBtn);
  const input = document.getElementById(SELECTORS.newPersonInpt)
  input.addEventListener('keydown', e => e.keyCode === 13 && addPerson())
  addBtn.addEventListener('click', addPerson)
}

const renderClearAllBtn = () => {
  const clearBtn = document.getElementById(SELECTORS.clearBtn);
  clearBtn.addEventListener('click', () => {
    renderPeople({ data: [] });
  })
}

const calculateDifferences = data => {
  const sum = data.reduce((acc, val) => acc += val.money, 0);
  const middleValue = sum / data.length;
  const newData = data.map(person => {
    person.difference = (person.money - middleValue).toFixed(1);
    return person;
  });
  return newData;
}

const displayDifferences = data => {
  data.forEach(person => {
    const diffEl = document.getElementById(`diff:${person.id}`);
    diffEl.innerHTML = person.difference > 0 ? `+${person.difference}` : person.difference;
    diffEl.className = `${SELECTORS.diff} ${person.difference < 0 ? 'red' : 'green'}`;
  })
}

window.onload = () => {
  const cachedData = window.localStorage.getItem('data');
  const data = cachedData ? JSON.parse(cachedData) : [];
  renderAddPersonBtn();
  renderClearAllBtn();
  renderPeople({ data, initRender: true });
  displayDifferences(calculateDifferences(data))
}
