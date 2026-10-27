import { CheckBoxGroup, CheckBoxItem } from "./check-box-group.js"
import { ChipItem, Chips } from "./chips.js"
import { DatePicker } from "./date-picker.js"
import { Form, FormControl, Label } from "./form.js"
import { Input, TextArea } from "./input.js"
import { OptionCard, OptionCards } from "./option-cards.js"
import { RadioGroup, RadioItem } from "./radio-group.js"
import { Select, SelectItem } from "./select.js"
import { Slider } from "./slider.js"
import { SwitchGroup, SwitchItem } from "./switch-group.js"

export const formsGroup = {
  name: "Forms",
  components: [
    Form,
    FormControl,
    Input,
    TextArea,
    Select,
    SelectItem,
    RadioGroup,
    RadioItem,
    CheckBoxGroup,
    CheckBoxItem,
    SwitchGroup,
    SwitchItem,
    Slider,
    DatePicker,
    Chips,
    ChipItem,
    OptionCards,
    OptionCard,
    Label,
  ],
  notes: [
    "- A form: Form(name, Buttons([...]), [FormControl(label, field), ...]). Its primary button checks every field's rules first, then sends the values.",
    '- Rules: Input("email", "you@example.com", "email", {required: true, email: true})',
    "- Chips for short tags to pick, OptionCards for choices worth a picture or a line of detail.",
    '- A filter outside a form binds its value: Input("search", "Search", "text", null, $query)',
  ],
}
