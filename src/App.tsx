import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();
  


function App() {
  const { user, signOut } = useAuthenticator();
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);

  useEffect(() => {
    // 型注釈を追加：unsubscribe() メソッドだけあれば OK
    const subscription: { unsubscribe(): void } = client.models.Todo
      .observeQuery({ authMode: "userPool" })
      .subscribe({
        next: ({ items }) => setTodos(items),
        error: (err) => console.error(err),
      });

    return () => subscription.unsubscribe();
  }, [user]); // ユーザー依存にしておくとさらに安全です

  async function createTodo() {
    if (!user) return; // non-null ガード
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

  async function deleteTodo(id: string) {
    if (!user) return; // non-null ガード
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
