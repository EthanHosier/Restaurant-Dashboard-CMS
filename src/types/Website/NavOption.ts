import DropdownOption from "./DropdownOption"

export default interface navOptions{
  name: string,
  url: string,
  dropdownOptions: DropdownOption[],
}