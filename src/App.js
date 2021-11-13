import React, { useRef, useState } from 'react'
import './App.css'

// Firebase SDK
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import 'firebase/compat/auth'

// Hooks
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
	apiKey: 'AIzaSyCdkxDsgJkcaJZz9qxULUSYMNVUC7HCmN8',
	authDomain: 'superchat-tientrinh21.firebaseapp.com',
	projectId: 'superchat-tientrinh21',
	storageBucket: 'superchat-tientrinh21.appspot.com',
	messagingSenderId: '545329500279',
	appId: '1:545329500279:web:57e5c783dedf5b1903f672',
	measurementId: 'G-CL0TH4RQED',
})

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
	const [user] = useAuthState(auth)

	return (
		<div className='App'>
			<header>
				<h1>⚛️Superchat</h1>
				<SignOut />
			</header>
			<section>{user ? <Chatroom /> : <SignIn />}</section>
		</div>
	)
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider()
		auth.signInWithPopup(provider)
	}

	return <button onClick={signInWithGoogle}>Sign in with Google</button>
}

function SignOut() {
	return auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
}

function Chatroom() {
	const dummy = useRef()

	const messagesRef = firestore.collection('messages')
	const query = messagesRef.orderBy('createdAt').limit(200)

	const [messages] = useCollectionData(query, { idField: 'id' })

	const [formValue, setFormValue] = useState('')

	const sendMessage = async e => {
		e.preventDefault()

		const { uid, photoURL } = auth.currentUser

		if (formValue !== '') {
			// Check if user say bad words and censored them
			const badWords = ['shit', 'fuck', 'dick', 'ass', 'motherfucker', 'pussy', 'whore']
			let textToBeAdded = formValue.toLowerCase()

			if (badWords.some(word => textToBeAdded.includes(word))) textToBeAdded = '🤐 CENSORED'
			else textToBeAdded = formValue

			await messagesRef.add({
				text: textToBeAdded,
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				uid,
				photoURL,
			})

			setFormValue('')
			dummy.current.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<>
			<main>
				{messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

				<div ref={dummy}></div>
			</main>

			<form onSubmit={sendMessage}>
				<input value={formValue} onChange={e => setFormValue(e.target.value)} />

				<button type='submit'>💬</button>
			</form>
		</>
	)
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message

	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt='' />
			<p>{text}</p>
		</div>
	)
}

export default App
