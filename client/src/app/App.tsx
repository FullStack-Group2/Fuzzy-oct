// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

import AppRouter from './Router';
import Provider from './Provider';
const App = () => {
  return (
    <Provider>
      <AppRouter />
    </Provider>
  );
};

export default App;
