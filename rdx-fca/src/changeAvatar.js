"use strict";

var utils = require("../utils");
var axios = require("axios");

async function postImage(api, BotID, form) {
  var Data = await api.httpPostFormData(
    `https://www.facebook.com/profile/picture/upload/?profile_id=${BotID}&photo_source=57&av=${BotID}`,
    form
  );
  return JSON.parse(Data.split("for (;;);")[1]);
}

module.exports = function (defaultFuncs, api, ctx) {
  return function changeAvatar(link, caption, callback) {
    var resolveFunc = function () {};
    var rejectFunc = function () {};
    var returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof caption === "function") {
      callback = caption;
      caption = "";
    }

    if (!callback) {
      callback = function (err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    if (!link) {
      return callback({ error: "Image URL or stream is required" });
    }

    try {
      var imagePromise;

      if (typeof link === "string" && (link.startsWith("http://") || link.startsWith("https://"))) {
        imagePromise = axios.get(link, { responseType: "stream" }).then(function (res) {
          return res.data;
        });
      } else {
        var fs = require("fs");
        var filePath = (typeof link === "object" && link.path) ? link.path : link;
        imagePromise = Promise.resolve(fs.createReadStream(filePath));
      }

      imagePromise
        .then(function (stream) {
          return postImage(api, ctx.userID, { file: stream });
        })
        .then(function (data) {
          if (!data || !data.payload || !data.payload.fbid) {
            throw new Error("Failed to upload image to Facebook. No fbid returned.");
          }
          var form = {
            av: ctx.userID,
            fb_api_req_friendly_name: "ProfileCometProfilePictureSetMutation",
            fb_api_caller_class: "RelayModern",
            doc_id: "5066134240065849",
            variables: JSON.stringify({
              input: {
                caption: caption || "",
                existing_photo_id: data.payload.fbid,
                expiration_time: null,
                profile_id: ctx.userID,
                profile_pic_method: "EXISTING",
                profile_pic_source: "TIMELINE",
                scaled_crop_rect: {
                  height: 1,
                  width: 1,
                  x: 0,
                  y: 0
                },
                skip_cropping: true,
                actor_id: ctx.userID,
                client_mutation_id: Math.round(Math.random() * 19).toString()
              },
              isPage: false,
              isProfile: true,
              scale: 3
            })
          };
          return defaultFuncs
            .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function (resData) {
              if (resData && resData.error) throw resData;
              return callback(null, true);
            });
        })
        .catch(function (err) {
          utils.error("changeAvatar", err);
          return callback(err);
        });
    } catch (e) {
      return callback(e);
    }

    return returnPromise;
  };
};

module.exports.credits = "SARDAR RDX";
