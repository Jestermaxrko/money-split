// const data = [{ name: 'Max', money: 100, id: 1, difference: 10 }]
let globalData = [];

const CLASSNAMES = {
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
}


function PeopleItem(person, onKeyPress, onRemove) {
  this.person = person;

  this.getRow = () => {
    const row = document.createElement('div');
    row.className = CLASSNAMES.personRow;
    return row;
  }

  this.getInput = () => {
    const input = document.createElement('input');
    input.className = CLASSNAMES.moneyInput;
    input.type = 'number';
    input.value = this.person.money || '';
    input.addEventListener('keyup', onKeyPress);
    return input;
  }

  this.getDeleteButton = () => {
    const button = document.createElement('button');
    button.className = CLASSNAMES.removeBtn;
    button.innerHTML = 'X'
    button.value = this.person.id;
    button.addEventListener('click', onRemove)
    return button;
  }

  this.getName = () => {
    const nameDiv = document.createElement('div');
    nameDiv.className = CLASSNAMES.nameBlock;
    const name = document.createElement('div');
    const difference = document.createElement('div');
    name.className = CLASSNAMES.personName;
    name.innerHTML = person.name;
    difference.className = `${CLASSNAMES.diff} ${person.difference < 0 ? 'red' : 'green'}`;
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

const setInLocalStore = data => window.localStorage.setItem('data', JSON.stringify(data));

const renderPeople = ({ data, initRender }) => {
  if (!initRender) {
    setInLocalStore(data);
  }
  globalData = data;
  const peopleList = document.getElementById(CLASSNAMES.peopleList);
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
  const addBtn = document.getElementById(CLASSNAMES.addBtn);
  addBtn.addEventListener('click', () => {
    const input = document.getElementById(CLASSNAMES.newPersonInpt)
    if (!input.value) return;
    const newData = [...globalData, { name: input.value, money: 0, difference: 0, id: Date.now() }];
    const calculatedData = calculateDifferences(newData);
    renderPeople({ data: calculatedData });
    displayDifferences(calculatedData);
    input.value = '';
  })
}

const renderClearAllBtn = () => {
  const clearBtn = document.getElementById(CLASSNAMES.clearBtn);
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
    diffEl.className = `${CLASSNAMES.diff} ${person.difference < 0 ? 'red' : 'green'}`;
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
