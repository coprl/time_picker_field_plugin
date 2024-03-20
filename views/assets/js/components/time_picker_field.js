class TimePickerField {
    constructor(element) {
        this.element = element
        this.input = this.element.querySelector('input[type="text"]')
        this.interval = parseInt(this.element.dataset.interval || 900) // seconds
        this.list = document.querySelector(`#${this.element.dataset.timeListId}`)
        this.formatter = new Intl.DateTimeFormat([], {timeStyle: "short"})

        // populate and hoist list up to body (to avoid z-index problems):
        this.populateList()
        document.body.append(this.list)

        // clobber the wrapped text_field's prepareSubmit function to avoid submitting two values
        // (the plugin's and the text_field):
        this.input.vComponent.prepareSubmit = (params) => {}

        this.input.addEventListener("focus", this.showPicker.bind(this))
        this.input.addEventListener("blur", (event) => {
            if (event.relatedTarget && event.relatedTarget.offsetParent == this.list) {
                return
            }

            this.hidePicker()
        })

        this.input.addEventListener("keydown", (event) => {
            switch (event.key) {
            case "ArrowDown":
                // move focus from the input field to the first list item:
                this.list.querySelector("li").focus()
                break
            case "Enter":
                // hide picker and prevent any enclosing form from being submitted:
                this.hidePicker()
                event.preventDefault()
                return false
            }
        })

        // scroll to and highlight matching list items as the user types:
        this.input.addEventListener("input", (event) => {
            this.showPicker()

            const value = this.input.value.toUpperCase()
            const candidate = this.list.querySelector(
                `[data-localized-value^="${value}"], [data-value^="${value}"]`
            )

            if (!candidate) {
                return
            }

            for (const item of this.list.querySelectorAll("li")) {
                item.classList.remove("time-picker-field__time-list__item--candidate")
            }

            this.list.scrollTop = candidate.offsetTop
            candidate.classList.add("time-picker-field__time-list__item--candidate")
        })

        if (this.input.value) {
            const date = this.parseTimeString(this.input.value)

            if (date) {
                this.input.value = this.formatter.format(date)
            }
        }
    }

    showPicker() {
        const wrapperRect = this.element.getBoundingClientRect()
        const inputBottom = this.input.getBoundingClientRect().bottom
        this.list.style.left = `${wrapperRect.left}px`
        this.list.style.width = `${wrapperRect.width}px`
        this.list.style.top = `${inputBottom + document.scrollingElement.scrollTop}px`
        this.list.classList.remove("v-hidden")
    }

    hidePicker() {
        this.list.classList.add("v-hidden")

        // clear candidates, as they aren't relevant across list openings.
        for (const item of this.list.querySelectorAll("li")) {
            item.classList.remove("time-picker-field__time-list__item--candidate")
        }
    }

    setValue(string) {
        const date = this.parseTimeString(string)

        if (!date) {
            console.warn(`Invalid time of day: ${string}`)
            return
        }

        const text = this.formatter.format(date)
        const value = TimePickerField.make24HourTimeString(date)

        this.input.vComponent.setValue(text)
        this.input.vComponent.validate()
        this.input.vComponent.mdcComponent.foundation_.notchOutline(Boolean(value))
    }

    static make24HourTimeString(date) {
        // this component deals with local time, so don't use getUTCHours or getUTCMinutes here.
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")

        return `${hours}:${minutes}`
    }

    prepareSubmit(params) {
        // submit a 24-hour time-of-day string:
        const date = this.parseTimeString(this.input.value)
        const value = date ? TimePickerField.make24HourTimeString(date) : ""

        params.push([this.input.name, value])
    }

    validate(formData) {
        if (!this.input.checkValidity()) {
            return {[this.input.id]: this.input.validationMessage}
        }

        if (!this.input.value && !this.input.required) {
            return true
        }

        // Attempt to parse the input's value to determine if it's valid:
        const date = this.parseTimeString(this.input.value)

        if (!date) {
            return {[this.input.id]: "Not a valid time of day"}
        }

        return true
    }

    reset() {
        this.input.value = this.input.vComponent.originalValue
    }

    isDirty() {
        const original = this.parseTimeString(this.originalValue)
        const current = this.parseTimeString(this.input.value)

        return current.localeCompare(original) != 0
    }

    destroy() {
        // need to clean up the hoisted menu element:
        this.list.remove()
    }

    /** @private */
    parseTimeString(timeString) {
        const now = new Date()
        const year = now.getFullYear().toString()
        const month = (now.getMonth() + 1).toString().padStart(2, "0")
        const day = now.getDate().toString().padStart(2, "0")

        // The only valid format accepted by Date.parse is `YYYY-MM-DDTHH:mm:ss.sssZ`, although
        // some components "can be omitted". Here, the plugin omits the time zone offset so the
        // date is parsed in the current time zone, as a local time.
        // Additionally, RFC 2822 is "supported by all major implementations", so the plugin uses
        // this fact to see if the input is a valid 12-hour time-of-day string. whew!
        const strings = [
            `${year}-${month}-${day}T${timeString}`, // 24-hour
            `${year}-${month}-${day} ${timeString}` // 12-hour
        ]

        for (const string of strings) {
            const timestamp = Date.parse(string)

            if (!isNaN(timestamp)) {
                return new Date(timestamp)
            }
        }

        return null
    }

    /** @private */
    populateList() {
        if (this.list.querySelector(".time-picker-field__time-list__item")) {
            return
        }

        const n = 24*60*60 / this.interval
        const midnight = new Date().setHours(0, 0, 0, 0)
        const fragment = document.createDocumentFragment()

        for (let i = 0; i < n; i++) {
            const date = new Date(midnight + i*this.interval*1000)
            fragment.appendChild(this.makeListItem(date))
        }

        this.list.querySelector("ul").appendChild(fragment)
    }

    /** @private */
    makeListItem(date) {
        const item = document.createElement("li")
        const value = TimePickerField.make24HourTimeString(date)
        const text = this.formatter.format(date)

        item.textContent = text
        item.classList.add("time-picker-field__time-list__item")
        item.tabIndex = "0"
        item.dataset.localizedValue = text
        item.dataset.value = value
        item.addEventListener("click", (event) => {
            this.setValue(value)
            this.hidePicker()
        })
        item.addEventListener("keydown", (event) => {
            switch (event.key) {
            case "ArrowDown":
                // Move focus to the next list item:
                event.preventDefault()

                if (item.nextElementSibling) {
                    item.nextElementSibling.focus()
                }

                break
            case "ArrowUp":
                // Move focus to the previous list item, or the field if at the top of the list:
                event.preventDefault()

                if (item.previousElementSibling) {
                    item.previousElementSibling.focus()
                } else {
                    this.input.focus()
                }

                break
            case "Enter":
                // Commit the highlighted list item:
                event.preventDefault()
                this.setValue(value)
                this.hidePicker()
                return false
            }
        })

        return item
    }
}

window.TimePickerField = TimePickerField
