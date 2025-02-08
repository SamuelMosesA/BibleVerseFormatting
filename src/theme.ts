import { createTheme, MantineColorsTuple, PasswordInput, TextInput } from '@mantine/core';
import classes from './Global.module.css'

const myColor: MantineColorsTuple = [
  "#fffde1",
  "#fff9cb",
  "#fff29a",
  "#ffea64",
  "#ffe438",
  "#ffe01d",
  "#ffde09",
  "#e3c500",
  "#caaf00",
  "#ae9600"
]


export const theme = createTheme({
  primaryColor: 'yellow',
  fontFamily: 'Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif',
  defaultRadius: 'md',
  colors: {
    'yellow': myColor,
  },
  headings: {
    fontFamily: 'Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif',
    fontWeight: 'bold',
  },
  components: {
    TextInput: TextInput.extend({
      defaultProps: {
        size: 'lg',
        classNames: {
          input: classes.text_input 
        }
        }
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps:{
        size: 'lg',
        classNames: {
          input: classes.text_input 
        }
      }
    }
    )
  }
});