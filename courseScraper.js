const puppeteer = require("puppeteer");
var fs = require("fs");

const getAllCourses = async function () {
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto("https://www.uvic.ca/BAN1P/bwckschd.p_disp_dyn_sched");

  await page.select('[name="p_term"]', "202201");

  await page.click('[type="submit"]');

  await page.waitForSelector('[name="sel_subj"]');

  const courseOptions = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#subj_id option")).map(
      (element) => element.value
    )
  );

  let courses = [];

  for (let i = 0; i < courseOptions.length; i++) {
    await page.select("#subj_id", courseOptions[i]);

    await page.click('[type="submit"]');

    await page.waitForSelector("#p_get_crse_unsec");

    let courseInfo = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(
          ".pagebodydiv > .datadisplaytable > tbody > tr"
        )
      )
        .map((tr) => {
          const courseText = tr.innerText + " ";
          return courseText.split("\n").filter((element) => {
            return element != "" && element != " ";
          });
        })
        .filter((element) => {
          return element.length > 0;
        })
    );

    courses.push(courseInfo);

    let course = {
      course_title: "",
      subject: "",
      course_code: "",
      term: "",
      term_string: "",
      levels: "",
      sections: [
        {
          crn: "",
          description: "",
          section_type: "",
          section_number: "",
          reg_start: "",
          reg_end: "",
          attributes: "",
          campus: "",
          schedule_type_alt: "",
          method: "",
          credits: "",
          catalog_entry: "",
          meeting_times: [],
        },
      ],
    };

    let courseTitle = "";

    for (let i = 0; i < courses.length; i += 2) {
      const courseHeader = courses[i].split(" - ");

      courseTitle = courseHeader[0];

      course.course_title = courseTitle;
      course.subject = courseHeader[2].split(" ")[0];
      course.course_code = courseHeader[2].split(" ")[1];
      console.log(course);
    }

    await page.goBack();
  }
  fs.writeFileSync("./data.json", JSON.stringify(courses, null, 2), "utf-8");

  await page.close();

  return;
};

module.exports = {
  getAllCourses: getAllCourses,
};
