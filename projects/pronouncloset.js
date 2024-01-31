window.onload = () => init();

function init() {
    console.log('init');

    // Load all data (names, pronouns, message blocks) from local storage, and if not available, use defaults instead.
    // set the UI and parser to the loaded data.
    LocalStorage.loadOrUseDefault();

    // initiate all button events
    document.querySelector('#addsentence')?.addEventListener('click', _ => handleCreateBlock());
    document.querySelectorAll('.editbttn').forEach(bttn => bttn.addEventListener('click', ev => handleStartEditBlock(ev)));
    document.querySelectorAll('.applybttn').forEach(bttn => bttn.addEventListener('click', ev => handleStopEditBlock(ev, true)));
    document.querySelectorAll('.cancelbttn').forEach(bttn => bttn.addEventListener('click', ev => handleStopEditBlock(ev, false)));
    document.querySelectorAll('.delbttn').forEach(bttn => bttn.addEventListener('click', ev => handleDeleteBlock(ev)));

    document.querySelector('#pronounrandomness').addEventListener('change', ev => handleChangeSetting(ev, 'pronouns'));
    document.querySelector('#namerandomness').addEventListener('change', ev => handleChangeSetting(ev, 'names'));
    document.querySelector('#options').addEventListener('change', ev => handleChangeSetting(ev, 'options'));

    document.querySelector('#reload').addEventListener('click', ev => handleReloadAllBlocks());

    document.querySelector('.pronoun-form').addEventListener('submit', ev => handleSubmitPronounForm(ev));
    document.querySelector('.name-form').addEventListener('submit', ev => handleSubmitNameForm(ev));
    document.querySelector('#preset-pronouns-dropdown').addEventListener('change', ev => handleSelectPreset(ev));
    document.querySelector('#remove-pronouns').addEventListener('click', ev => handleRemovePronounSets(ev));
    document.querySelector('#remove-name').addEventListener('click', ev => handleRemoveNames(ev));

    document.querySelector('#resetls').addEventListener('click', ev => handleResetLS(ev));
}

class PronounSet {
    /**
     * Create a pronoun set. If only first param set, use that as object. \
     * in that case, subOrPronouns: \
     * { \
     *      sub: "xe", \
     *      obj: "xer", \
     *      pod: "xer", \
     *      pop: "xers", \
     *      ref: "xerself", \
     *      name: null \
     * }
     * @param {*} subOrPronouns Subjective pronoun or if the rest is null/'', it is an object that holds all information
     * @param {String} obj Objective pronoun
     * @param {String} pod Possessive determiner
     * @param {String} pop Possessive pronoun
     * @param {String} ref reflexive pronoun
     * @param {String} name name
     */
    constructor(subOrPronouns, obj = '', pod = '', pop = '', ref = '', name = null) {
        if (!obj) {
            // subOrPronouns holds all conjugations, name, etc.
            this.subject = subOrPronouns.sub;
            this.object = subOrPronouns.obj;
            this.possessiveDeterminer = subOrPronouns.pod;
            this.possessivePronoun = subOrPronouns.pop;
            this.reflexive = subOrPronouns.ref;
            this.name = subOrPronouns.name;
        }
        else {
            this.subject = subOrPronouns;
            this.object = obj;
            this.possessiveDeterminer = pod;
            this.possessivePronoun = pop;
            this.reflexive = ref;
            this.name = name;
        }
        
    }

    /**
     * Turn pronoun set into human-readable string
     * @returns Stringified pronounset in the form of sub/obj/pod/pop/ref[|name] (in brackets is optional)
     */
    toString() {
        if (this.name) {
            return `${this.subject}/${this.object}/${this.possessiveDeterminer}/${this.possessivePronoun}/${this.reflexive}|${this.name}`;
        }
        else {
            return `${this.subject}/${this.object}/${this.possessiveDeterminer}/${this.possessivePronoun}/${this.reflexive}`;
        }
    }

    toObj() {
        return {
            sub: this.subject,
            obj: this.object,
            pod: this.possessiveDeterminer,
            pop: this.possessivePronoun,
            ref: this.reflexive,
            name: this.name
        };
    }

    /**
     * Create pronoun set from string
     * @param {PronounSet} str string to convert into pronoun set
     * @returns a pronoun set, or null if it could not parse it correctly
     */
    static fromString(str) {
        let parts = str.split('/');
        if (parts.length != 5) {
            return null;
        }
        let sub = parts[0];
        let obj = parts[1];
        let pod = parts[2];
        let pop = parts[3];

        let refNameSplit = parts[4].split('|');
        let ref = refNameSplit[0];
        let name = null;
        if (refNameSplit.length > 1) {
            name = refNameSplit[1];
        }
        return new PronounSet(sub, obj, pod, pop, ref, name);
    }
}


class UIInteraction {

    /**
     * Create a new sentence block.
     * @returns {HTMLElement} the newly created sentence block
     */
    static createNewBlock(formatText = '') {
        let sentenceWrapper = document.createElement('LI');
        sentenceWrapper.classList.add('message-block');

        let text = document.createElement('P');
        text.className = 'text-field';
        // set to format text. The block needs to be parsed later
        text.value = formatText;

        let editField = document.createElement('TEXTAREA');
        editField.className = 'edit-field onlyedit';
        editField.innerText = formatText || '';
        editField.placeholder = 'Write a couple of sentences using the syntax explained in the left panel...';

        let controls = this.createBlockControls();

        sentenceWrapper.append(text, editField, controls);

        return sentenceWrapper;
    }

    /**
     * Creates all the controls needed and attaches event handlers to them.
     * @returns element with all the controls attached to it.
     */
    static createBlockControls() {
        let controls = document.createElement('DIV');
        controls.classList.add('controls');

        let filler = document.createElement('SPAN');
        filler.classList.add('filler');

        let editBttn = this.createButton('editbttn', 'Edit', 'Edit this sentence.', ev => handleStartEditBlock(ev));
        let applyBttn = this.createButton('applybttn onlyedit', 'Apply', 'Apply the changes.', ev => handleStopEditBlock(ev, true));
        let cancelBttn = this.createButton('cancelbttn onlyedit', 'Cancel', 'Cancel any changes made.', ev => handleStopEditBlock(ev, false));
        let delBttn = this.createButton('delBttn', 'Delete', 'Remove this sentence', ev => handleDeleteBlock(ev));

        controls.append(filler, applyBttn, cancelBttn, editBttn, delBttn);

        return controls;
    }

    /**
     * 
     * @param {String} className the class to attach to the button
     * @param {String} value the display value
     * @param {String} title the title text
     * @param {Function} callback click event callback function
     * @returns the created button
     */
    static createButton(className, value, title, callback) {
        let bttn = document.createElement('INPUT');
        bttn.type = 'button';
        bttn.className = className;
        bttn.value = value;
        bttn.title = title;
        bttn.addEventListener('click', ev => callback(ev));
        return bttn;
    }

    static addBlockToList(elem) {
        let list = document.querySelector('.sentence-list');
        list.append(elem);
    }

    static clearBlockList() {
        let list = document.querySelector('.sentence-list');
        removeAllChildren(list);
    }

    /**
     * Start editing block by showing the textarea.
     * @param {Element} block the sentence element
     */
    static startEditBlock(block) {
        block.classList.add('editing');
    }

    /**
     * Stop editing sentence block, parse textarea field according to the rules, and display in paragraph.
     * @param {Element} block the sentence block
     * @param {Boolean} shouldApply if the edits should be applied or not
     */
    static stopEditBlock(block, shouldApply) {
        if (shouldApply) {
            this.updateBlock(block);

            let formatText = block.querySelector('.edit-field')?.value;
            if (formatText) {
                LocalStorage.saveBlock(formatText);
            }
        }
    
        block.classList.remove('editing');
    }


    /**
     * Removes the sentence block from the DOM.
     * @param {Element} block block to delete
     */
    static deleteBlock(block) {
        // TODO add confirm box

        let formatText = block.querySelector('.edit-field').value;
        LocalStorage.deleteBlock(formatText);

        block.remove();
    }


    static submitPronounForm() {
        let sub = document.querySelector('#input-pronoun-sub')?.value;
        let obj = document.querySelector('#input-pronoun-obj')?.value;
        let pod = document.querySelector('#input-pronoun-pod')?.value;
        let pop = document.querySelector('#input-pronoun-pop')?.value;
        let ref = document.querySelector('#input-pronoun-ref')?.value;
        let name = document.querySelector('#input-pronoun-name')?.value || null;
        if (sub && obj && pod && pop && ref) {
            let pronounSet = new PronounSet(sub, obj, pod, pop, ref, name);
            this.addNewPronounSetEntry(pronounSet);

            // Set local storage value
            LocalStorage.savePronounSet(pronounSet);
        }
    }

    static addNewPronounSetEntry(pronounSet) {
        let pronounList = document.querySelector('#selected-pronouns');
        if (!pronounList) return;

        // Add the set to the parser list
        Parser.addPronounSet(pronounSet);

        // Add stringified version to UI list
        let string = pronounSet.toString();
        this.submitSelectEntry(pronounList, string);
    }

    static submitNameForm() {
        let name = document.querySelector('#input-name')?.value;
        if (name) {
            this.addNewNameEntry(name);

            // Set local storage value
            LocalStorage.saveName(name);
        }
    }

    static addNewNameEntry(name) {
        let nameList = document.querySelector('#selected-names');
        if (nameList) {
            // Add name to parser list
            Parser.addName(name);


            // Add stringified version to UI list
            this.submitSelectEntry(nameList, name);
        }
    }

    static clearNameSelectEntries() {
        let listElem = document.querySelector('#selected-names');
        if (!listElem) return;
        removeAllChildren(listElem);
    }

    static clearPronounsSelectEntries() {
        let listElem = document.querySelector('#selected-pronouns');
        if (!listElem) return;
        removeAllChildren(listElem);
    }

    static createSelectEntry(str) {
        let option = document.createElement('OPTION');
        option.id = str;
        option.value = str;
        option.innerText = str;
        return option;
    }

    static submitSelectEntry(listElem, formattedString) {
        let option = this.createSelectEntry(formattedString);
        listElem.append(option);
    }

    static changeRules(target, type) {
        let changedRule = {};
        if (type == 'pronouns') {
            changedRule.pronounRandomMode = target.value;
        }
        else if (type == 'names') {
            changedRule.nameRandomMode = target.value;
        }
        else if (type == 'options') {
            if (target.id == 'setting-usenameonly') {
                changedRule.useNameOnly = target.checked;
            }
            else if (target.id == 'setting-linkednames') {
                changedRule.isNameLinked = target.checked;
            }
            else {
                console.error('Unknown option. No rules changed.')
            }
        }
        else {
            console.error('Unknown setting category. No rules changed.');
        }
        Parser.setRules(changedRule);
        LocalStorage.saveRules(changedRule);
    }

    static setRulesUI(rules) {
        if (rules.pronounRandomMode) {
            let mode = this._findMode(rules.pronounRandomMode);
            
            let option = document.querySelector(`#pronounrandom${mode}`);
            if (option) {
                option.checked = true;
            }
        }
        if (rules.nameRandomMode) {
            let mode = this._findMode(rules.nameRandomMode);
            
            let option = document.querySelector(`#namerandom${mode}`);
            if (option) {
                option.checked = true;
            }
        }
        if (typeof rules.useNameOnly === 'boolean') {
            let box = document.querySelector('#setting-usenameonly');
            if (box) {
                box.checked = rules.useNameOnly;
            }
        }
        if (typeof rules.isNameLinked === 'boolean') {
            let box = document.querySelector('#setting-linkednames');
            if (box) {
                box.checked = rules.isNameLinked;
            }
        }
    }

    static _findMode(randomness) {
        switch (randomness) {
            case 'random':
                return 1;
            case 'sentence':
                return 2;
            case 'block':
            default:
                return 3;
        }
    }

    static removePronounSets() {
        let pronounsList = document.querySelector('#selected-pronouns');
        let childCount = pronounsList.children.length;
        if (pronounsList.selectedOptions) {
            let selected = pronounsList.selectedOptions;
            // loop over selected options. Ensure there is always at least one element left
            for (let i = 0; i < selected.length && childCount - i > 1; i++) {
                let setElem = selected[i];
                let pronounSet = PronounSet.fromString(setElem.innerText);
                Parser.removePronounSet(pronounSet);
                setElem.remove();
                // remove from Local storage
                LocalStorage.deletePronounSet(pronounSet);
            }
        }
    }

    static removeName() {
        let nameList = document.querySelector('#selected-names');
        if (nameList.selectedOptions) {
            for (let nameElem of nameList.selectedOptions) {
                let name = nameElem.innerText;
                Parser.removeName(name);
                nameElem.remove();
                // remove from local storage
                LocalStorage.deleteName(name);
            }
        }
    }

    static selectPronounPreset(ev) {
        let pronounString = ev.target.value;
        if (pronounString != '') {
            let pronounSet = pronounString.split('/');
            let pronounElems = document.querySelectorAll('.pronoun-form input[type=text]');
            // Set all of the values of the pronoun form to their respective pronoun conjugation.
            for (let i = 0; i < pronounSet.length; i++) {
                pronounElems[i].value = pronounSet[i];
            }
        }
    }

    static reloadAllBlocks() {
        document.querySelectorAll('.message-block').forEach(elem => {
            this.updateBlock(elem);
        });
    }

    /**
     * Parse text and update block with parsed text
     * @param {HTMLElement} block the block to parse and update the text of
     */
    static updateBlock(block) {
        let template = block.querySelector('.edit-field');
        let outputElem = block.querySelector('.text-field');
        if (template && outputElem) {
            let parsedText = Parser.parseText(template.value);
            outputElem.innerHTML = parsedText;
        }
    }

    static getPronounSets() {
        let pronounSets = [];
        let pronounsList = document.querySelector('#selected-pronouns');
        let children = pronounsList.children;
        for (let i = 0; i < children.length; i++) {
            let setElem = children[i];
            let pronounSet = PronounSet.fromString(setElem.innerText);
            if (null != pronounSet) {
                pronounSets.push(pronounSet);
            }
        }
        return pronounSets;
    }

    static getNames() {
        let names = [];
        let nameList = document.querySelector('#selected-names');
        let children = nameList.children;
        for (let i = 0; i < children.length; i++) {
            let setElem = children[i];
            let name = setElem.innerText;
            names.push(name);
        }
        return names;
    }

    static getRules() {
        let useNameOnly = document.querySelector('#setting-usenameonly');
        let isNameLinked = document.querySelector('#setting-linkednames');
        let pronounRandomMode = document.querySelector('#pronounrandomness');
        let nameRandomMode = document.querySelector('#namerandomness');

        let rules = {};
        if (useNameOnly) {
            rules.useNameOnly = useNameOnly.checked;
        }
        if (isNameLinked) {
            rules.isNameLinked = isNameLinked.checked;
        }
        if (pronounRandomMode) {
            rules.pronounRandomMode = pronounRandomMode.elements['pronounrandomness'].value;
        }
        if (nameRandomMode) {
            rules.nameRandomMode = nameRandomMode.elements['namerandomness'].value;
        }
        return rules;
    }
    
}

class Parser {
    static rules = {
        // options are 'random', 'sentence', 'block'.
        pronounRandomMode: 'random',
        // options are 'random', 'sentence', 'block'.
        nameRandomMode: 'random',
        isNameLinked: false,
        useNameOnly: false
    };

    static allowedRandomModes = ['random', 'sentence', 'block'];
    static pronounSets = [];
    static names = [];

    /**
     * Add pronoun set to list
     * @param {PronounSet} set set to add to list
     */
    static addPronounSet(set) {
        this.pronounSets.push(set);
    }

    /**
     * Remove pronoun set from list
     * @param {PronounSet} set set to remove
     */
    static removePronounSet(set) {
        this.pronounSets = removeFromArray(this.pronounSets, set);
    }

    /**
     * Add name to list
     * @param {String} name name to add to list
     */
    static addName(name) {
        this.names.push(name);
    }

    /**
     * Remove name from list
     * @param {String} name name to remove from list
     */
    static removeName(name) {
        this.names = removeFromArray(this.names, name);
    }

    /**
     * Set the parser rules. All rules not changed, should be null or undefined.
     * @param {*} rules the rules to set.
     */
    static setRules(rules) {
        if (null != rules.pronounRandomMode && this.allowedRandomModes.includes(rules.pronounRandomMode)) {
            this.rules.pronounRandomMode = rules.pronounRandomMode;
        }
        if (null != rules.nameRandomMode && this.allowedRandomModes.includes(rules.nameRandomMode)) {
            this.rules.nameRandomMode = rules.nameRandomMode;
        }
        if (null != rules.isNameLinked) {
            this.rules.isNameLinked = !!rules.isNameLinked;
        }
        if (null != rules.useNameOnly) {
            this.rules.useNameOnly = !!rules.useNameOnly;
        }
    }

    static initSettings(pronounSets = null, names = null, rules = null) {
        this.pronounSets = pronounSets || UIInteraction.getPronounSets();
        this.names = names || UIInteraction.getNames();
        this.setRules(rules || UIInteraction.getRules());
    }


    /**
     * Parse the given text and insert pronouns/names according to the rules.
     * @param {String} text the text to parse
     * @returns the parsed text.
     */
    static parseText(text) {
        if ((this.pronounSets.length == 0 && !this.rules.useNameOnly) || this.names.length == 0) {
            // no pronouns (and not use name only) or no names present
            // TODO display warning/error message
            console.error("There are no pronouns, or if name-only mode, no names to use for parsing. Returning original format text.")
            return text;
        }

        // Split all sentences, first by dot, then by exclamation mark, then by question mark.
        // This recursive structure allows us to stitch it back together correctly later.
        let sentences = text.split('.').map(x => x.split('!').map(y => y.split('?')));

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
                    let sentence = splitByExclamation[question];
                    let parsed = '';
                    if (sentence != '') {
                        let result = this.parseSentence(sentence, this.pronounSets, this.names, this.rules, chosenSet, chosenName);
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
    static parseSentence(sentence, sets, names, rules, chosenSet, chosenName) {
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
        return { set: chosenSet, name: chosenName, parsedText: replaced };
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
    static replaceText(sentence, set, name, useNameOnly, replaceAllPronouns, replaceAllNames) {
        // Set regex global flag if all names should be replaced.
        let nFlags = replaceAllNames ? 'gi' : 'i';
        if (useNameOnly) {
            // replace everything with name only.
            return sentence.replace(new RegExp(/{sub}/, nFlags), name)
                .replace(new RegExp(/{obj}/, nFlags), name)
                .replace(new RegExp(/{pod}/, nFlags), `${name}'s`)
                .replace(new RegExp(/{pop}/, nFlags), `${name}'s`)
                .replace(new RegExp(/{ref}/, nFlags), name)
                .replace(new RegExp(/{name}/, nFlags), `${name}`); // it is a bit awkward, but the best option without any context. Doesn't work with "{Sub} told me {ref}", but that one has no suitable alternative.
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
    static choosePronounSet(sets, chosenSet, rules, isStartSentence) {
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
    static chooseName(names, chosenSet, chosenName, rules, isStartSentence) {
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
    static pickPronounSet(sets) {
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
    static pickName(names, chosenSet, isNameLinked) {
        if (isNameLinked && chosenSet.name) {
            return chosenSet.name;
        }
        return pickRandom(names);
    }
}

class LocalStorage {
    static storageNameBlocks = 'blocks';
    static storageNamePronouns = 'pronoun_sets';
    static storageNameNames = 'names';
    static storageNameRules = 'settings';

    static defaults = {
        blocks: [
            "This is {pod} test. {Sub} told me {ref} that it was {pop}. I told {obj} that is fine. No problem, {name}!"
        ],
        pronounSets: [
            {
                sub: "xe",
                obj: "xer",
                pod: "xer",
                pop: "xers",
                ref: "xerself",
                name: null
            }
        ],
        names: ["Cyana"],
        rules: {
            // options are 'random', 'sentence', 'block'.
            pronounRandomMode: 'random',
            // options are 'random', 'sentence', 'block'.
            nameRandomMode: 'random',
            isNameLinked: false,
            useNameOnly: false
        }
    };

    // clear all data
    static clear() {
        localStorage.clear();
    }

    static getItem(key) {
        console.log('getting', key);
        return JSON.parse(localStorage.getItem(key));
    }

    static setItem(key, val) {
        console.log('setting', key, val);
        localStorage.setItem(key, JSON.stringify(val));
    }

    static loadOrUseDefault() {
        let blocks = this.loadBlocks(this.defaults.blocks);
        let pronounSets = this.loadPronouns(this.defaults.pronounSets);
        let names = this.loadNames(this.defaults.names);
        let rules = this.loadRules(this.defaults.rules);

        // update UI
        
        UIInteraction.clearBlockList();
        for (let block of blocks) {
            UIInteraction.addBlockToList(block);
        }

        UIInteraction.clearPronounsSelectEntries();
        for (let set of pronounSets) {
            UIInteraction.addNewPronounSetEntry(set);
        }

        UIInteraction.clearNameSelectEntries();
        for (let name of names) {
            UIInteraction.addNewNameEntry(name);
        }

        UIInteraction.setRulesUI(rules);


        // update the parser with the loaded values.
        Parser.initSettings(pronounSets, names, rules);

        // re-parse all blocks
        UIInteraction.reloadAllBlocks();
    }

    static _loadBlocksObj(blocksDefault) {
        // use spread syntax to clone array
        return this.getItem(this.storageNameBlocks) || [...blocksDefault];
    }

    static loadBlocks(blocksDefault) {
        let texts = this._loadBlocksObj(blocksDefault);
        let blockElements = [];
        // create a new block for each text
        for (let textBlock of texts) {
            let block = UIInteraction.createNewBlock(textBlock);
            blockElements.push(block);
        }
        return blockElements;
    }

    static _loadPronounsObj(pronounsDefault) {
        return this.getItem(this.storageNamePronouns) || [...pronounsDefault];
    }

    static loadPronouns(pronounsDefault) {
        let pronounSetList = this._loadPronounsObj(pronounsDefault);
        let sets = [];
        for (let setObj of pronounSetList) {
            let pronounSet = new PronounSet(setObj);
            sets.push(pronounSet);
        }
        return sets;
    }

    static loadNames(namesDefault) {
        let names = this.getItem(this.storageNameNames) || [...namesDefault];
        return names;
    }

    static loadRules(rulesDefault) {
        let rulesLS = this.getItem(this.storageNameRules);
        if (null == rulesLS) {
            let rules = {};
            rules.pronounRandomMode = rulesDefault.pronounRandomMode;
            rules.nameRandomMode = rulesDefault.nameRandomMode;
            rules.isNameLinked = rulesDefault.isNameLinked;
            rules.useNameOnly = rulesDefault.useNameOnly;
            return rules;
        }

        return this._mergeRules(rulesDefault, rulesLS);
    }

    static saveBlock(formatText) {
        let blocks = this._loadBlocksObj(this.defaults.blocks);
        blocks.push(formatText);
        this.setItem(this.storageNameBlocks, blocks);
    }
    
    static savePronounSet(set) {
        let pronounSets = this._loadPronounsObj(this.defaults.pronounSets);
        pronounSets.push(set.toObj());
        this.setItem(this.storageNamePronouns, pronounSets);
    }

    static saveName(name) {
        let names = this.loadNames(this.defaults.names);
        names.push(name);
        this.setItem(this.storageNameNames, names);
    }

    static saveRules(rules) {
        let oldRules = this.loadRules(this.defaults.rules);
        let newRules = this._mergeRules(oldRules, rules);
        this.setItem(this.storageNameRules, newRules);
    }

    static deleteBlock(formatText) {
        let blocks = this._loadBlocksObj(this.defaults.blocks);
        let newBlocks = removeFromArray(blocks, formatText);
        this.setItem(this.storageNameBlocks, newBlocks);
    }

    static deletePronounSet(set) {
        let pronounSets = this._loadPronounsObj(this.defaults.pronounSets);
        let newPronounSets = removeFromArray(pronounSets, set.toObj());
        this.setItem(this.storageNamePronouns, newPronounSets);
    }

    static deleteName(name) {
        let names = this.loadNames(this.defaults.names);
        removeFromArray(names, name);
        this.setItem(this.storageNameNames, names);
    }

    // static resetRules() {
    //     this.removeItem(this.storageNameRules);
    // }

    static _mergeRules(prevRules, newRules) {
        let rules = {};
        rules.pronounRandomMode = newRules.pronounRandomMode || prevRules.pronounRandomMode;
        rules.nameRandomMode = newRules.nameRandomMode || prevRules.nameRandomMode;
        rules.isNameLinked = newRules.isNameLinked;
        if (typeof newRules.isNameLinked !== "boolean") {
            rules.isNameLinked = prevRules.isNameLinked;
        }
        rules.useNameOnly = newRules.useNameOnly;
        if (typeof newRules.useNameOnly !== "boolean") {
            rules.useNameOnly = prevRules.useNameOnly;
        }
        return rules;
    }
}

/**
 * Handle changes to the settings.
 * @param {Event} ev change event.
 * @param {String} type the type of setting that needs to change (pronouns, names, options)
 */
function handleChangeSetting(ev, type) {
    UIInteraction.changeRules(ev.target, type);
}

/**
 * Handle the creation of a new sentence block. Start editing sentence after created.
 */
function handleCreateBlock() {
    console.log('handling creation sentence...');
    let blockElement = UIInteraction.createNewBlock();
    UIInteraction.addBlockToList(blockElement);
    // Set to edit mode
    UIInteraction.startEditBlock(blockElement);
}

/**
 * Handle editing of a sentence block.
 * @param {Event} event click event
 */
function handleStartEditBlock(ev) {
    console.log('handling edit...');
    let block = ev.target.parentElement.parentElement;
    UIInteraction.startEditBlock(block);
}

/**
 * Handle finishing edit of block
 * @param {Event} ev click event
 * @param {*} shouldApply whether changes should be applied or not
 */
function handleStopEditBlock(ev, shouldApply) {
    let block = ev.target.parentElement.parentElement;
    UIInteraction.stopEditBlock(block, shouldApply);
}

/**
 * Handle deletion of a sentence block.
 * @param {Event} ev click event
 */
function handleDeleteBlock(ev) {
    console.log('handling deletion...');
    let block = ev.target.parentElement.parentElement;
    UIInteraction.deleteBlock(block);
}

/**
 * Handle reloading all message blocks with the current rules.
 */
function handleReloadAllBlocks() {
    UIInteraction.reloadAllBlocks();
}

/**
 * Handle selecting pronoun preset.
 * @param {Event} ev change event
 */
function handleSelectPreset(ev) {
    UIInteraction.selectPronounPreset(ev);
}

/**
 * Handle submitting pronoun form.
 * @param {Event} ev submit event
 */
function handleSubmitPronounForm(ev) {
    ev.preventDefault();
    UIInteraction.submitPronounForm();
}

/**
 * Handle submitting name form
 * @param {Event} ev submit event
 */
function handleSubmitNameForm(ev) {
    ev.preventDefault();
    UIInteraction.submitNameForm();
}

/**
 * Handle removing 1 or more pronoun sets
 * @param {Event} ev click event
 */
function handleRemovePronounSets(ev) {
    UIInteraction.removePronounSets();
}

/**
 * Handle removing 1 or more names
 * @param {Event} ev click event
 */
function handleRemoveNames(ev) {
    UIInteraction.removeName();
}

/**
 * Clear local storage and reload page
 * @param {Event} ev click event
 */
function handleResetLS(ev) {
    // TODO add confirm
    LocalStorage.clear();
    window.location.reload(true); // it may clear cache, but it is deprecated
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
    let valJson = JSON.stringify(val);
    for (let i = 0; i < arr.length; i++) {
        // using json stringify as a cheap object comparison
        if (JSON.stringify(arr[i]) === valJson) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
}

function removeAllChildren(elem) {
    while (elem.lastChild) {
        elem.removeChild(elem.lastChild);
    }
}
