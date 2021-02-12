const modal = {
    toggle(){
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transaction) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))
    }
}

const balance = {
    all: storage.get(),
    add(transaction) {
        balance.all.push(transaction)
        App.reload()
    },
    remove(index) {
        balance.all.splice(index, 1)

        App.reload()
    },
    incomes() {
        let income = 0
        balance.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income;
    },
    expenses() {
        let expense = 0
        balance.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
             }
        })
    
        return expense;
    },
    total() {
        return balance.incomes() + balance.expenses()
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="balance.remove(${index})" src="./assets/minus.svg" alt="Remover transaão">
            </td>
        `

        return html
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = utils.formatCurrency(balance.incomes())
        document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(balance.expenses())
        document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(balance.total())
    },
    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const utils = {
    formatAmount(value){
        value = Number(value) * 100
        return Math.round(value)
    },
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues() {
            return {
                description: form.description.value,
                amount: form.amount.value,
                date: form.date.value,
            }
    },
    formatData(){
        let { description, amount, date } = form.getValues()

        amount = utils.formatAmount(amount)
        date = utils.formatDate(date)
        return {
            description,
            amount,
            date
        }
    },
    validateFields(){
        const { description, amount, date } = form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos")
        }
    },
    clearFields(){
        form.description.value = ""
        form.amount.value = ""
        form.date.value = ""
    },
    submit(event) {
        event.preventDefault()

        try{
            form.validateFields()
            const transaction = form.formatData()
            balance.add(transaction)
            form.clearFields()
            modal.toggle()
        } catch (error) {
            alert(error.message)
        }
    }
}



const App = {
    init(){
        balance.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        storage.set(balance.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()