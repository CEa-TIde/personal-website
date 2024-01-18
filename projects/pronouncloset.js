window.onload = () => init();

function init() {
    console.log('init');
    // Load all data (names, pronouns, message blocks) from local storage, and if not available, use defaults instead.
    loadOrUseDefault();

    // initiate all button events
    document.querySelector('#addsentence')?.addEventListener('click', _ => handleCreateSentence());
    document.querySelectorAll('.editbttn').forEach(bttn => bttn.addEventListener('click', ev => handleStartEditSentence(ev)));
    document.querySelectorAll('.applybttn').forEach(bttn => bttn.addEventListener('click', ev => handleStopEditSentence(ev, true)));
    document.querySelectorAll('.cancelbttn').forEach(bttn => bttn.addEventListener('click', ev => handleStopEditSentence(ev, false)));
    document.querySelectorAll('.delbttn').forEach(bttn => bttn.addEventListener('click', ev => handleDeleteSentence(ev)));

    document.querySelector('#pronounrandomness').addEventListener('change', ev => handleChangeSetting(ev, 'pronouns'));
    document.querySelector('#namerandomness').addEventListener('change', ev => handleChangeSetting(ev, 'names'));
    document.querySelector('#options').addEventListener('change', ev => handleChangeSetting(ev, 'options'));

    document.querySelector('#reload').addEventListener('click', ev => handleReloadAllBlocks());

    document.querySelector('.pronoun-form').addEventListener('submit', ev => handleSubmitPronounForm(ev));
    document.querySelector('.name-form').addEventListener('submit', ev => handleSubmitNameForm(ev));
    document.querySelector('#preset-pronouns-dropdown').addEventListener('change', ev => handleSelectPreset(ev));
    document.querySelector('#remove-pronouns').addEventListener('click', ev => handleRemovePronounSet(ev));
    document.querySelector('#remove-name').addEventListener('click', ev => handleRemoveName(ev));
}

const parser = new Parser();



function loadOrUseDefault() {

}

/**
 * Handle changes to the settings.
 * @param {*} event change event.
 * @param {String} type the type of setting that needs to change (pronouns, names, options)
 */
function handleChangeSetting(event, type) {
    let rules = {};
    let target = event.target;
    if (type == 'pronouns') {
        rules.pronounRandomMode = target.value;
    }
    else if (type == 'names') {
        rules.nameRandomMode = target.value;
    }
    else if (type == 'options') {
        if (target.id == 'setting-usenameonly') {
            rules.useNameOnly = target.checked;
        }
        else if (target.id == 'setting-linkednames') {
            rules.isNameLinked = target.checked;
        }
        else {
            console.error('Unknown option. No rules changed.')
        }
    }
    else {
        console.error('Unknown setting category. No rules changed.');
    }
    parser.setRules(rules);
    console.log(rules);
}

/**
 * Handle the creation of a new sentence. Start editing sentence after created.
 */
function handleCreateSentence() {
    console.log('handling creation sentence...');
    let list = document.querySelector('.sentence-list');
    let sentenceElement = createNewSentence();
    list.append(sentenceElement);
    // Set to edit mode
    startEditSentence(sentenceElement);
}

/**
 * Create a new sentence.
 * @returns {Element} the newly created sentence
 */
function createNewSentence(editText = '') {
    let sentenceWrapper = document.createElement('LI');
    sentenceWrapper.classList.add('message-block');

    let text = document.createElement('P');
    text.className = 'text-field';
    text.value = '';
    // if not empty, parse edit text with pronoun sets and names.
    if (editText != '') {
        saveSentence(text, editText);
    }

    let editField = document.createElement('TEXTAREA');
    editField.className = 'edit-field onlyedit';
    editField.innerText = editText || '';
    editField.placeholder = 'Write a couple of sentences using the syntax explained in the left panel...';

    let controls = createControls();

    sentenceWrapper.append(text, editField, controls);

    return sentenceWrapper;
}

/**
 * Creates all the controls needed and attaches event handlers to them.
 * @returns element with all the controls attached to it.
 */
function createControls() {
    let controls = document.createElement('DIV');
    controls.classList.add('controls');

    let editBttn = document.createElement('INPUT');
    editBttn.classList.add('editbttn');
    editBttn.value = 'Edit';
    editBttn.title = 'Edit this sentence.';
    editBttn.type = 'button';
    editBttn.addEventListener('click', ev => handleStartEditSentence(ev));

    let applyBttn = document.createElement('INPUT');
    applyBttn.className = 'applybttn onlyedit';
    applyBttn.value = 'Apply';
    applyBttn.title = 'Apply the changes.';
    applyBttn.type = 'button';
    applyBttn.addEventListener('click', ev => handleStopEditSentence(ev, true));

    let cancelBttn = document.createElement('INPUT');
    cancelBttn.className = 'cancelbttn onlyedit';
    cancelBttn.value = 'Cancel';
    cancelBttn.title = 'Cancel any changes made.';
    cancelBttn.type = 'button';
    cancelBttn.addEventListener('click', ev => handleStopEditSentence(ev, false));

    let delBttn = document.createElement('INPUT');
    delBttn.classList.add('delbttn');
    delBttn.value = 'Delete';
    delBttn.title = 'Remove this sentence';
    delBttn.type = 'button';
    delBttn.addEventListener('click', ev => handleDeleteSentence(ev));

    controls.append(applyBttn, cancelBttn, editBttn, delBttn);

    return controls;
}

/**
 * Handle editing of a sentence.
 * @param {*} event click event
 */
function handleStartEditSentence(event) {
    console.log('handling edit...');
    let sentence = event.target.parentElement.parentElement;
    startEditSentence(sentence);
}

/**
 * Start editing sentence by showing the textarea.
 * @param {Element} sentence the sentence element
 */
function startEditSentence(sentence) {
    sentence.classList.add('editing');
}

function handleStopEditSentence(event, shouldApply) {
    let sentence = event.target.parentElement.parentElement;
    stopEditSentence(sentence, shouldApply);
}

/**
 * Stop editing sentence, parse textarea field according to the rules, and display in paragraph.
 * @param {Element} sentence the sentence element
 * @param {Boolean} shouldApply if the edits should be applied or not
 */
function stopEditSentence(sentence, shouldApply) {
    if (shouldApply) {
        text = sentence.querySelector('.edit-field').value;
        pElement = sentence.querySelector('.text-field');
        parser.updateBlock(pElement, text);
    }

    sentence.classList.remove('editing');
}

/**
 * Handle deletion of a sentence.
 * @param {*} event click event
 */
function handleDeleteSentence(event) {
    console.log('handling deletion...');
    let sentence = event.target.parentElement.parentElement;
    deleteSentence(sentence);
}

/**
 * Removes the sentence from the DOM.
 * @param {Element} sentence sentence to delete
 */
function deleteSentence(sentence) {
    // TODO add confirm box
    sentence.remove();
}

/**
 * Reload all message blocks with the current rules.
 */
function handleReloadAllBlocks() {
    document.querySelectorAll('.message-block').forEach(elem => {
        let template = elem.querySelector('.edit-field');
        let outputElem = elem.querySelector('.text-field');
        if (template && outputElem) {
            parser.updateBlock(outputElem, template.value);
        }
    });
}

function handleSelectPreset(event) {
    let pronounString = event.target.value;
    if (pronounString != '') {
        let pronounSet = pronounString.split('/');
        let pronounElems = document.querySelectorAll('.pronoun-form input[type=text]');
        // Set all of the values of the pronoun form to their respective pronoun conjugation.
        for (let i = 0; i < pronounSet.length; i++) {
            pronounElems[i].value = pronounSet[i];
        }
    }
}

function handleSubmitPronounForm(ev) {
    ev.preventDefault();
    let sub = document.querySelector('#input-pronoun-sub')?.value;
    let obj = document.querySelector('#input-pronoun-obj')?.value;
    let pod = document.querySelector('#input-pronoun-pod')?.value;
    let pop = document.querySelector('#input-pronoun-pop')?.value;
    let ref = document.querySelector('#input-pronoun-ref')?.value;
    let name = document.querySelector('#input-pronoun-name')?.value;
    let pronounList = document.querySelector('#selected-pronouns');
    if (sub && obj && pod && pop && ref && pronounList) {
        let string;
        if (name) {
            string = `${sub}/${obj}/${pod}/${pop}/${ref}|${name}`;
        }
        else {
            string = `${sub}/${obj}/${pod}/${pop}/${ref}`;
        }
        submitFormEntry(pronounList, string);
    }
}

function handleSubmitNameForm(ev) {
    ev.preventDefault();
    let name = document.querySelector('#input-name')?.value;
    let nameList = document.querySelector('#selected-names');
    if (name && nameList) {
        submitFormEntry(nameList, name);
    }
}

function handleRemovePronounSet(ev) {
    let pronounsList = document.querySelector('#selected-pronouns');
    removeSelectOptions(pronounsList);
}

function handleRemoveName(ev) {
    let nameList = document.querySelector('#selected-names');
    removeSelectOptions(nameList);
}

function removeSelectOptions(selElem) {
    if (selElem.selectedOptions) {
        for (let set of selElem.selectedOptions) {
            set.remove();
        }
    }
}

function submitFormEntry(listElem, formattedString) {
    let option = document.createElement('OPTION');
    option.id = formattedString;
    option.value = formattedString;
    option.innerText = formattedString;
    listElem.append(option);
}

/**
 * Create a pronoun set.
 * @param {String} sub Subjective pronoun
 * @param {String} obj Objective pronoun
 * @param {String} pod Possessive determiner
 * @param {String} pop Possessive pronoun
 * @param {String} ref reflexive pronoun
 * @param {String} name name
 */
function PronounSet(sub, obj, pod, pop, ref, name = null) {
    this.subject = sub;
    this.object = obj;
    this.possessiveDeterminer = pod;
    this.possessivePronoun = pop;
    this.reflexive = ref;
    this.name = name;
}

function Parser() {
    this.rules = {
        // options are 'random', 'sentence', 'block'.
        pronounRandomMode: 'random',
        // options are 'random', 'sentence', 'block'.
        nameRandomMode: 'random',
        isNameLinked: false,
        useNameOnly: false
    };
    this.pronounSets = [];
    this.names = [];

    this.addPronounSet = function(set) {
        this.pronounSets.push(set);
    }

    this.removePronounSet = function(set) {
        this.pronounSets = removeFromArray(this.pronounSets, set);
    }

    this.addName = function(name) {
        this.names.push(name);
    }

    this.removeName = function(name) {
        this.names = removeFromArray(this.names, name);
    }

    /**
     * Set the parser rules. All rules not changed, should be null or undefined.
     * @param {*} rules the rules to set.
     */
    this.setRules = function(rules) {
        if (null != rules.pronounRandomMode) {
            this.rules.pronounRandomMode = rules.pronounRandomMode;
        }
        if (null != rules.nameRandomMode) {
            this.rules.nameRandomMode = rules.nameRandomMode;
        }
        if (null != rules.isNameLinked) {
            this.rules.isNameLinked = rules.isNameLinked;
        }
        if (null != rules.useNameOnly) {
            this.rules.useNameOnly = rules.useNameOnly;
        }
    }

    this.updateBlock = function(elem, text) {
        let parsed = this.parseText(text, this.pronounSets, this.names, this.rules);
        elem.innerHTML = parsed;
    }


    /**
     * Parse the given text and insert pronouns/names according to the rules.
     * @param {String} text the text to parse
     * @param {PronounSet[]} sets the pronoun sets to choose from
     * @param {String[]} names the names to choose from
     * @param {*} rules the rules to follow when parsing
     * @returns the parsed text.
     */
    this.parseText = function(text, sets, names, rules) {
        // Split all sentences, first by dot, then by exclamation mark, then by question mark.
        // This recursive structure allows us to stitch it back together correctly later.
        sentences = text.split('.').map(x => x.split('!').map(y => y.split('?')));
    
        let chosenSet = null;
        let chosenName = null;

        let parsedText = [];
        // loop over all dot separated sentences
        for (let dot = 0; dot < sentences.length; dot++) {
            let splitByDot = sentences[dot];
            // build structure for result
            parsedText.push([]);
            // loop over all exclamation mark separated sentences
            for (let exclamation = 0; exclamation < splitByDot.length; exclamation++) {
                let splitByExclamation = splitByDot[exclamation];
                // build structure for result
                parsedText[dot].push([]);
                // loop over all question mark separated sentences
                for (let question = 0; question < splitByExclamation.length; question++) {
                    sentence = splitByExclamation[question];
                    let parsed = '';
                    if (sentence != '') {
                        let result = this.parseSentence(sentence, sets, names, rules, chosenSet, chosenName);
                        chosenSet = result.chosenSet;
                        chosenName = result.chosenName;
                        parsed = result.parsedText;
                    }
                    parsedText[dot][exclamation].push(parsed);
                }
                parsedText[dot][exclamation] = parsedText[dot][exclamation].join('?');
            }
            parsedText[dot] = parsedText[dot].join('!');
        }
        parsedText = parsedText.join('.');
        return parsedText;
    }

    /**
     * Parses a singular sentence.
     * @param {String} sentence sentence to parse
     * @param {PronounSet[]} sets pronoun sets to use
     * @param {String[]} names names to use
     * @param {*} rules the rules to follow when parsing
     * @param {PronounSet} chosenSet previously chosen pronoun set
     * @param {String} chosenName previously chosen name
     * @returns the parsed sentence
     */
    this.parseSentence = function(sentence, sets, names, rules, chosenSet, chosenName) {
        // Setting: Replace all pronouns in sentence if mode not in random or there is only one set.
        let replaceAllPronouns = (rules.pronounRandomMode != 'random' || sets.length < 2);
        // Setting: Replace all names in sentence if mode not in random or there is only one name.
        let replaceAllNames = (rules.nameRandomMode != 'random' || names.length < 2);
        // Setting: use name only if that rule is set or if there are no pronoun sets to choose from.
        let useNameOnly = rules.useNameOnly || sets.length < 1;
        let replaced = sentence;
        let isStartSentence = true;
        do {
            // If needed set new pronoun set and name
            chosenSet = this.choosePronounSet(sets, chosenSet, rules, isStartSentence);
            chosenName = this.chooseName(names, chosenSet, chosenName, rules, isStartSentence);
            isStartSentence = false;

            sentence = replaced;
            replaced = this.replaceText(sentence, chosenSet, chosenName, useNameOnly, replaceAllPronouns, replaceAllNames);
        } while (replaced != sentence);
        return {set: chosenSet, name: chosenName, parsedText: replaced};
    }

    /**
     * (Partially) replace the text with pronouns
     * @param {String} sentence the sentence to replace (parts of) the text from.
     * @param {PronounSet} set the pronoun set to replace with.
     * @param {String} name the name to use.
     * @param {Boolean} useNameOnly whether to use the name only or also use pronouns
     * @param {Boolean} replaceAllPronouns whether to replace all pronouns at once.
     * @param {Boolean} replaceAllNames whether to replace all names at once.
     * @returns the (partially) parsed text.
     */
    this.replaceText = function(sentence, set, name, useNameOnly, replaceAllPronouns, replaceAllNames) {
        // Set regex global flag if all names should be replaced.
        let nFlags = replaceAllNames ? 'gi' : 'i';
        if (useNameOnly) {
            // replace everything with name only.
            return sentence.replace(new RegExp(/{sub}/, nFlags), name)
                .replace(new RegExp(/{obj}/, nFlags), name)
                .replace(new RegExp(/{pod}/, nFlags), `${name}'s`)
                .replace(new RegExp(/{pop}/, nFlags), `${name}'s`)
                .replace(new RegExp(/{ref}/, nFlags), name)
                .replace(new RegExp(/{name}/, nFlags), name);
        }
        else {
            // Only replace the name and leave pronouns intact.
            sentence = sentence.replace(new RegExp(/{name}/, nFlags), name);
        }
    
        // Set regex global flag if all pronouns should be replaced.
        let sFlags = replaceAllPronouns ? 'g' : '';
        // Replace all pronouns (and their capitalised versions)
        return sentence.replace(new RegExp(/{sub}/, sFlags), set.subject)
            .replace(new RegExp(/{pod}/, sFlags), set.possessiveDeterminer)
            .replace(new RegExp(/{obj}/, sFlags), set.object)
            .replace(new RegExp(/{pop}/, sFlags), set.possessivePronoun)
            .replace(new RegExp(/{ref}/, sFlags), set.reflexive)
            .replace(new RegExp(/{Sub}/, sFlags), capitalise(set.subject))
            .replace(new RegExp(/{Pod}/, sFlags), capitalise(set.possessiveDeterminer))
            .replace(new RegExp(/{Obj}/, sFlags), capitalise(set.object))
            .replace(new RegExp(/{Pop}/, sFlags), capitalise(set.possessivePronoun))
            .replace(new RegExp(/{Ref}/, sFlags), capitalise(set.reflexive));
    }

    /**
     * If needed, choose a new pronoun set from the available. Otherwise return the previous one.
     * @param {PronounSet[]} sets Available pronoun sets.
     * @param {PronounSet} chosenSet previously chosen set.
     * @param {*} rules the rules to follow when choosing.
     * @param {Boolean} isStartSentence whether or not it is the start of a sentence.
     * @returns The pronoun set to be used.
     */
    this.choosePronounSet = function(sets, chosenSet, rules, isStartSentence) {
        if (null == chosenSet || rules.pronounRandomMode == 'random' || rules.pronounRandomMode == 'sentence' && isStartSentence) {
            chosenSet = this.pickPronounSet(sets);
        }
        return chosenSet;
    }

    /**
     * If needed, choose a new name from the available, or if that rule is set, from the pronoun set.
     * Otherwise return the previous one.
     * @param {String[]} names Available names.
     * @param {PronounSet} chosenSet previously chosen pronoun set.
     * @param {String} chosenName previously chosen name.
     * @param {*} rules the rules to follow when choosing.
     * @param {Boolean} isStartSentence whether or not it is the start of a sentence.
     * @returns The name to be used.
     */
    this.chooseName = function(names, chosenSet, chosenName, rules, isStartSentence) {
        if (null == chosenName || rules.isNameLinked && chosenSet.name || 
            rules.nameRandomMode == 'random' || rules.nameRandomMode == 'sentence' && isStartSentence) {
            
            chosenName = this.pickName(names, chosenSet, rules.isNameLinked && chosenSet.name);
        }
        return chosenName;
    }

    /**
     * Picks a pronoun set at random.
     * @param {Object[]} sets the sets to choose from.
     * @returns the chosen pronoun set.
     */
    this.pickPronounSet = function(sets) {
        return pickRandom(sets);
    }

    /**
     * Pick and return a name.
     * If names are not linked, or a name is not available in the chosen pronoun set,
     * a name is picked randomly from the names list.
     * Otherwise, the name stored along with the pronouns is returned.
     * @param {String[]} names the names to pick from.
     * @param {Object[]} chosenSet the chosen pronoun set (including optional linked name).
     * @param {Boolean} isNameLinked if the names are linked to the pronoun sets or not.
     * @returns 
     */
    this.pickName = function(names, chosenSet, isNameLinked) {
        if (isNameLinked && chosenSet.name) {
            return chosenSet.name;
        }
        return pickRandom(names);
    }
}

/**
 * Capitalise the first letter of the passed string.
 * @param {String} str 
 * @returns String with first letter capitalised.
 */
function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Pick and return a random element from an array.
 * @param {*[]} set the array to pick from.
 * @returns the chosen element.
 */
function pickRandom(set) {
    let idx = Math.floor(Math.random() * set.length);
    return set[idx];
}

/**
 * Remove the first occurrence of a value from an array
 * @param {*[]} arr array
 * @param {*} val value to remove from array
 * @returns The new array with the value removed (if it was present)
 */
function removeFromArray(arr, val) {
    let idx = arr.indexOf(val);
    if (idx > -1) {
        arr.splice(idx, 1);
    }
    return arr;
}
