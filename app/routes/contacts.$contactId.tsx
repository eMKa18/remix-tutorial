import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { FunctionComponent } from "react";

import type { ContactRecord } from "~/data";
import { getContact, updateContact } from "~/data";

export const loader = async ({params,} : LoaderFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    const contact = await getContact(params.contactId);
    if(!contact) {
        throw new Response("Not Found", {status: 404});
    }
    return json({contact});
}

export async function action({params, request}: ActionFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  return updateContact(params.contactId, {favorite: formData.get("favorite") === "true"});
}

export default function Contact() {
    const {contact} = useLoaderData<typeof loader>();

    return (
        <div id="contact">
            <div>
                <img 
                    src={contact.avatar} 
                    alt={`${contact.first} ${contact.last} avatar`} 
                    key={contact.avatar} crossOrigin="anonymous"
                />
            </div>

            <div>
                <h1>
                    {contact.first || contact.last ? (
                        <>
                            {contact.first} {contact.last}
                        </>
                    ) : (
                        <i>No Name</i>
                    )}{" "}
                    <Favorite contact={contact} />
                </h1>
                {contact.twitter ? (
                    <p>
                        <a href={`https://twitter.com/${contact.twitter}`}>
                            {contact.twitter}
                        </a>
                    </p>
                ) : null}
                {contact.notes ? <p>{contact.notes}</p> : null}

                <div>
                    <Form action="edit">
                        <button type="submit">Edit</button>
                    </Form>
                    <Form 
                        action="destroy"
                        method="post"
                        onSubmit={(event) => {
                            const response = confirm(
                                "Please confirm you want to delete this record."
                            );
                            if(!response) {
                                event.preventDefault();
                            }
                        }}
                    >
                        <button type="submit">Delete</button>
                    </Form>
                </div>
            </div>
        </div>
    );
}

const Favorite: FunctionComponent<{
    contact: Pick<ContactRecord, "favorite">;
}> = ({contact}) => {
    const fetcher = useFetcher();
    const favorite = fetcher.formData ? fetcher.formData.get("favorite") === "true" : contact.favorite;

    return (
        <fetcher.Form method="post">
            <button 
                aria-label=
                    {favorite 
                        ? "Remove from favorites" 
                        : "Add to favorites"} 
                name="favorite" 
                value={favorite ? "false" : "true"}
            >
                {favorite ? "★" : "☆"}
            </button>
        </fetcher.Form>
    )
}