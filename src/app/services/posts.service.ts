import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpParams,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, throwError } from "rxjs";
import { map, catchError, tap } from "rxjs/operators";
import { Post } from "../models/post.model";

@Injectable({
  providedIn: "root",
})
export class PostsService {
  postError = new Subject<string>();

  constructor(private http: HttpClient) {}

  createAndStorePost(title: string, content: string) {
    const postData: Post = { title: title, content: content };

    // firebase requires you add a folder for storing your data e.g /posts.json at the end of your realtime database's reference URL
    this.http
      .post<{ name: string }>(
        "https://angular-complete-guide-6b994-default-rtdb.firebaseio.com/posts.json",
        postData,
        {
          observe: "response",
        }
      )
      .subscribe(
        (responseData) => {
          console.log(responseData);
        },
        (error) => {
          this.postError.next(error.message);
        }
      );
  }

  fetchPosts() {
    let searchParams = new HttpParams();
    searchParams = searchParams.append("print", "pretty");
    searchParams = searchParams.append("custom", "key");

    return this.http
      .get<{ [key: string]: Post }>(
        "https://angular-complete-guide-6b994-default-rtdb.firebaseio.com/posts.json",
        {
          headers: new HttpHeaders({ "Custom-Header": "Hello" }),
          params: searchParams,
          responseType: "json",
        }
      )
      .pipe(
        map((responseData) => {
          const postsArray: Post[] = [];

          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ id: key, ...responseData[key] });
            }
          }
          return postsArray;
        }),
        catchError((error) => {
          // Send to analytics server

          return throwError(error);
        })
      );
  }

  deleteAllPosts() {
    return this.http
      .delete(
        "https://angular-complete-guide-6b994-default-rtdb.firebaseio.com/posts.json",
        {
          observe: "events",
          responseType: "text",
        }
      )
      .pipe(
        tap((event) => {
          console.log(event);

          if (event.type === HttpEventType.Sent) {
            // .... do something in the UI maybe to let the user know that the request was sent successfully
          }

          if (event.type === HttpEventType.Response) {
            console.log(event.body);
          }
        })
      );
  }
}
