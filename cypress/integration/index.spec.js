
describe('homepage', ()=>{
  it('shows the title', ()=>{
      cy.visit('/');
      cy.contains('Local Plaques');
  })
})