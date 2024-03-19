class TimePickerField {
    constructor(element) {
        this.element = element
        this.input = this.element.querySelector("input")
        this.list = document.querySelector(`#${this.element.dataset.timeListId}`)

        // hoist list up to body to avoid z-index problems:
        document.body.append(this.list)

        this.input.vComponent.prepareSubmit = this.prepareSubmit.bind(this)
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
                // if the user has typed all or part of a time, commit it on Enter:
                const candidate = this.list.querySelector(".time-picker-field__time-list__item--candidate")

                if (this.list.checkVisibility() && candidate) {
                    this.input.vComponent.setValue(candidate.dataset.text)
                    this.hidePicker()

                    // ... and avoid submitting any enclosing <form>:
                    event.preventDefault()
                    return false
                }

                break
            }
        })

        // scroll to and highlight matching list items as the user types:
        this.input.addEventListener("input", (event) => {
            this.showPicker()

            const value = this.input.value.toUpperCase()
            const candidate = this.list.querySelector(`[data-text^="${value}"],[data-value^="${value}"]`)

            if (!candidate) {
                return
            }

            for (const item of this.list.querySelectorAll("li")) {
                item.classList.remove("time-picker-field__time-list__item--candidate")
            }

            this.list.scrollTop = candidate.offsetTop
            candidate.classList.add("time-picker-field__time-list__item--candidate")
        })

        for (const item of this.list.querySelectorAll("li")) {
            item.addEventListener("click", this.clickItem.bind(this))
            item.addEventListener("keydown", (event) => {
                switch (event.key) {
                case "ArrowDown":
                    // Move focus to the next list item:
                    event.preventDefault()
                    if (item.nextElementSibling) {
                        item.nextElementSibling.focus()
                    }
                    return false
                case "ArrowUp":
                    // Move focus to the previous list item, or the field if at the top of the list:
                    event.preventDefault()
                    if (item.previousElementSibling) {
                        item.previousElementSibling.focus()
                    } else if (item.dataset.index == "0") {
                        this.input.focus()
                    }
                    return false
                case "Enter":
                    // Commit the highlighted list item:
                    event.preventDefault()
                    this.setValue(event.target.dataset.text)
                    this.hidePicker()
                    return false
                }
            })
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

    setValue(value) {
        this.input.vComponent.setValue(value)
        this.input.vComponent.validate()
        this.input.vComponent.mdcComponent.foundation_.notchOutline(Boolean(this.input.value))
    }

    validate(formData) {
        if (!this.input.reportValidity()) {
            return {[this.input.id]: this.input.validationMessage}
        }

        if (!this.input.value && !this.input.required) {
            return true
        }

        // Attempt to parse the input's value to determine if it's valid:
        const value = this.input.value
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getUTCMonth()
        const day = now.getUTCDate()
        const date = Date.parse(`${year}-${month}-${day}T${value}:00.000Z`)

        if (isNaN(date)) {
            return {[this.input.id]: "Not a valid time of day"}
        }

        return true
    }

    prepareSubmit(params) {
        // TODO: use originalName junk so input displays locale-aware time but submits 24-hour time.
        params.push([this.input.name, this.input.value])
    }

    reset() {
        this.input.value = this.input.vComponent.originalValue
    }

    isDirty() {
        return this.input.value.localeCompare(this.originalValue) != 0
    }

    destroy() {
        // need to clean up the hoisted menu element:
        this.list.remove()
    }

    /** @private */
    clickItem(event) {
        this.setValue(event.target.dataset.text)
        this.hidePicker()
    }
}

window.TimePickerField = TimePickerField
