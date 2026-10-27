# Forms

When a request needs details from the user, such as a booking or a sign-up, the model can answer with a form:

```text
root = Stack([signUp])
signUp = Form("signup", Buttons([Button("Sign up", @ToAssistant("Sign me up"))]), [email, plan, topics])
email = FormControl("Email", Input("email", "you@example.com", "email", {required: true, email: true}), "We never share it")
plan = FormControl("Plan", Select("plan", [SelectItem("free", "Free"), SelectItem("pro", "Pro")], "Pick a plan", {required: true}))
topics = FormControl("Topics", CheckBoxGroup("topics", [CheckBoxItem("News", "", "news"), CheckBoxItem("Offers", "", "offers")]))
```

`Form` takes a name, its buttons, and its fields, each in a `FormControl` that gives it a label and an optional hint. The fields are `Input`, `TextArea`, `Select`, `RadioGroup`, `CheckBoxGroup`, `SwitchGroup` and `Slider`; see [Components](components.md) for their arguments.

## Where the values go

A field inside a form keeps its value under the form's name, so two forms in one answer never mix their fields:

```javascript
answer.values // { signup: { email: "ada@example.com", plan: "pro", topics: { offers: true } } }
```

Typing into a field is a `fieldChange` event on the entity. A `CheckBoxGroup` or `SwitchGroup` holds an object of each box's name and whether it is ticked.

A field outside a form keeps its value under its own name, or in the `$variable` it is bound to.

## Rules

A field's `rules` say what it must hold for the form to go ahead:

| Rule                     | Passes when the value                |
| ------------------------ | ------------------------------------ |
| `required: true`         | is filled in                         |
| `email: true`            | looks like an email address          |
| `url: true`              | looks like a URL                     |
| `numeric: true`          | is a number                          |
| `min`, `max`             | is a number at least or at most that |
| `minLength`, `maxLength` | is at least or at most that long     |
| `pattern`                | matches that regular expression      |

The form's primary button checks every field before an action that sends the values somewhere: back to the assistant, to a mutation, or to a custom action. When a rule fails, nothing is sent, and each failing field shows why. The messages are in the entity too, by form and field:

```javascript
answer.fieldErrors // { signup: { email: "This field is required" } }
```

A field's message goes as soon as it changes. Secondary buttons, and actions that only set values or open a link, act without checking.

## What a form sends

An action from inside a form sends only that form's fields, in `formState`, with its name in `formName`:

```javascript
{ type: "continue_conversation", humanFriendlyMessage: "Sign me up", formName: "signup",
  formState: { signup: { email: "ada@example.com", plan: "pro" } } }
```

To save straight to the app's tools instead, bind the fields to `$variables`, which a mutation's arguments can read; the rules still apply:

```text
$email = ""
subscribe = Mutation("subscribe", {email: $email})
form = Form("news", Buttons([Button("Subscribe", @Run(subscribe))]), [FormControl("Email", Input("email", "you@example.com", "email", {required: true, email: true}, $email))])
```

See [Data from tools](tools.md) for mutations.

Next: [Data from tools](tools.md)
