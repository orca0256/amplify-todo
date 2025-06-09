// src/App.tsx
import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);

  useEffect(() => {
    // ① 認証モードを userPool に指定
    const subscription = client.models.Todo
      .observeQuery(
        /* filter? */ {},
        { authMode: "userPool" }
      )
      .subscribe({
        next: ({ items }) => setTodos(items),
        error: (err) => console.error(err),
      });

    return () => subscription.unsubscribe();
  }, []);

  // ② create 時にも authMode を指定
  async function createTodo() {
    const content = window.prompt("Todo content");
    if (!content) return;

    const { data, errors } = await client.models.Todo.create(
      { content },
      { authMode: "userPool" }
    );

    if (errors) {
      console.error("Create error:", errors);
    } else {
      console.log("Created:", data);
    }
  }

  // ③ delete 時にも authMode を指定
  async function deleteTodo(id: string) {
    const { errors } = await client.models.Todo.delete(
      { id },
      { authMode: "userPool" }
    );
    if (errors) console.error("Delete error:", errors);
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}’s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
            {todo.content}
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;


