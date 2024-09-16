class DropDownCheckBoxes extends HTMLElement{
 
    constructor(){
        super();

        const shadow = this.attachShadow({mode: 'open'});

        const nome = this.getAttribute("nome");

        const formCheck = document.createElement('div');

        const input = document.createElement('input');
        input.setAttribute('type','checkbox');
        input.setAttribute('id','checkbox-' + nome);
        if (this.hasAttribute('checked')) input.checked = true;
        input.setAttribute('onchange','hide_element(\"'+nome+'\")')

        const label = document.createElement('label');
        label.setAttribute('class','form-check-check');
        label.setAttribute('for','checkbox-' + nome);

        label.textContent = this.getAttribute("texto");;

        formCheck.appendChild(input);
        formCheck.appendChild(label);

        shadow.appendChild(formCheck);
    }
}

customElements.define('dropdown-checkbox',DropDownCheckBoxes);