import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();
  


function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);

  useEffect(() => {
    let subscription;
    if (user) {
      // ユーザーがログインしているときのみ subscribe
      subscription = client.models.Todo
        .observeQuery({ authMode: "userPool" })
        .subscribe({
          next: ({ items }) => setTodos(items),
          error: (err) => console.error(err),
        });
    } else {
      // ログアウト時にはリストをクリア
      setTodos([]);
    }

    return () => subscription?.unsubscribe();
  }, [user]);

  // create 時にも authMode を指定
  async function createTodo() {
    const content = window.prompt("Todo content");
    if (!content || !user) return;

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

  // delete 時にも authMode を指定
  async function deleteTodo(id: string) {
    if (!user) return;

    const { errors } = await client.models.Todo.delete(
      { id },
      { authMode: "userPool" }
    );
    if (errors) console.error("Delete error:", errors);
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}’s todos</h1>
      <button onClick={createTodo} disabled={!user}>
        + new
      </button>
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
        <a
          href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates"
          target="_blank"
          rel="noopener noreferrer"
        >
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;


